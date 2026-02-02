import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc,
  query, 
  where,
  orderBy,
  Timestamp,
  setDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ESGTopic, ESGCategory, TopicWithScore } from '@/types/esg';
import { toast } from 'sonner';

export function useFirestoreTopics(projectId: string | null) {
  const [topics, setTopics] = useState<TopicWithScore[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(async () => {
    if (!projectId) {
      setTopics([]);
      return;
    }

    setLoading(true);
    try {
      console.log('🔥 Fetching topics for project:', projectId);
      
      // Fetch topics
      const topicsRef = collection(db, 'topics');
      const topicsQuery = query(
        topicsRef, 
        where('project_id', '==', projectId),
        orderBy('created_at', 'asc')
      );
      const topicsSnapshot = await getDocs(topicsQuery);
      
      const topicsData: ESGTopic[] = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        project_id: doc.data().project_id,
        category: doc.data().category as ESGCategory,
        name: doc.data().name,
        description: doc.data().description || null,
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      
      console.log('🔥 Fetched topics:', topicsData);

      // Fetch assessments (survey responses)
      const assessmentsRef = collection(db, 'assessments');
      const assessmentsQuery = query(
        assessmentsRef,
        where('project_id', '==', projectId)
      );
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      
      const assessmentsMap = new Map<string, {
        stakeholder_importance: number;
        business_impact: number;
        materiality_score: number;
      }>();
      
      assessmentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        assessmentsMap.set(data.topic_id, {
          stakeholder_importance: data.stakeholder_importance,
          business_impact: data.business_impact,
          materiality_score: data.materiality_score,
        });
      });

      console.log('🔥 Fetched assessments:', Array.from(assessmentsMap.entries()));

      // Combine topics with their scores
      const topicsWithScores: TopicWithScore[] = topicsData.map(topic => {
        const assessment = assessmentsMap.get(topic.id);
        return {
          ...topic,
          stakeholder_importance: assessment?.stakeholder_importance,
          business_impact: assessment?.business_impact,
          materiality_score: assessment?.materiality_score,
        };
      });

      setTopics(topicsWithScores);
    } catch (error) {
      console.error('🔥 Error fetching topics:', error);
      toast.error('Failed to load topics from Firestore');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const createTopic = async (category: ESGCategory, name: string, description?: string) => {
    if (!projectId) return null;

    try {
      console.log('🔥 Creating topic:', { category, name, description });
      const topicsRef = collection(db, 'topics');
      const now = Timestamp.now();
      
      const docRef = await addDoc(topicsRef, {
        project_id: projectId,
        category,
        name,
        description: description || null,
        created_at: now,
      });
      
      const newTopic: TopicWithScore = {
        id: docRef.id,
        project_id: projectId,
        category,
        name,
        description: description || null,
        created_at: now.toDate().toISOString(),
      };
      
      console.log('🔥 Created topic:', newTopic);
      setTopics(prev => [...prev, newTopic]);
      toast.success('Topic added successfully');
      return newTopic;
    } catch (error) {
      console.error('🔥 Error creating topic:', error);
      toast.error('Failed to add topic');
      return null;
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      console.log('🔥 Deleting topic:', topicId);
      
      // Delete the topic
      await deleteDoc(doc(db, 'topics', topicId));
      
      // Also delete the assessment if it exists
      const assessmentsRef = collection(db, 'assessments');
      const q = query(assessmentsRef, where('topic_id', '==', topicId));
      const snapshot = await getDocs(q);
      
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'assessments', docSnapshot.id));
      }
      
      setTopics(prev => prev.filter(t => t.id !== topicId));
      toast.success('Topic deleted');
    } catch (error) {
      console.error('🔥 Error deleting topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const saveSurveyResponse = async (
    topicId: string,
    stakeholderImportance: number,
    businessImpact: number,
    silent: boolean = false
  ) => {
    if (!projectId) return null;

    try {
      console.log('🔥 Saving assessment:', { topicId, stakeholderImportance, businessImpact });
      
      // Calculate materiality score
      const materialityScore = (stakeholderImportance + businessImpact) / 2;
      
      const now = Timestamp.now();
      
      // Check if assessment exists for this topic
      const assessmentsRef = collection(db, 'assessments');
      const q = query(assessmentsRef, where('topic_id', '==', topicId));
      const snapshot = await getDocs(q);
      
      const assessmentData = {
        topic_id: topicId,
        project_id: projectId,
        stakeholder_importance: stakeholderImportance,
        business_impact: businessImpact,
        materiality_score: materialityScore,
        timestamp: now,
        updated_at: now,
      };
      
      if (snapshot.empty) {
        // Create new assessment
        const docRef = await addDoc(assessmentsRef, {
          ...assessmentData,
          created_at: now,
        });
        console.log('🔥 Created assessment:', docRef.id);
      } else {
        // Update existing assessment
        const existingDoc = snapshot.docs[0];
        await setDoc(doc(db, 'assessments', existingDoc.id), {
          ...existingDoc.data(),
          ...assessmentData,
        });
        console.log('🔥 Updated assessment:', existingDoc.id);
      }

      // Update local state
      setTopics(prev =>
        prev.map(t =>
          t.id === topicId
            ? {
                ...t,
                stakeholder_importance: stakeholderImportance,
                business_impact: businessImpact,
                materiality_score: materialityScore,
              }
            : t
        )
      );

      if (!silent) {
        toast.success('Assessment saved to Firestore');
      }
      
      return { stakeholder_importance: stakeholderImportance, business_impact: businessImpact, materiality_score: materialityScore };
    } catch (error) {
      console.error('🔥 Error saving assessment:', error);
      if (!silent) {
        toast.error('Failed to save assessment');
      }
      return null;
    }
  };

  const getTopicsByCategory = (category: ESGCategory) =>
    topics.filter(t => t.category === category);

  const getScoredTopics = () =>
    topics.filter(t => t.materiality_score !== undefined);

  const getTopMaterialTopics = (limit = 5) =>
    getScoredTopics()
      .sort((a, b) => (b.materiality_score || 0) - (a.materiality_score || 0))
      .slice(0, limit);

  return {
    topics,
    loading,
    createTopic,
    deleteTopic,
    saveSurveyResponse,
    getTopicsByCategory,
    getScoredTopics,
    getTopMaterialTopics,
    refetch: fetchTopics,
  };
}
