import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ESGTopic, ESGCategory, TopicWithScore, SurveyResponse } from '@/types/esg';
import { toast } from 'sonner';

export function useESGTopics(projectId: string | null) {
  const [topics, setTopics] = useState<TopicWithScore[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(async () => {
    if (!projectId) {
      setTopics([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('esg_topics')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (topicsError) throw topicsError;

      // Fetch survey responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('project_id', projectId);

      if (responsesError) throw responsesError;

      // Combine topics with their scores
      const topicsWithScores: TopicWithScore[] = (topicsData || []).map(topic => {
        const response = responsesData?.find(r => r.topic_id === topic.id);
        return {
          ...topic,
          stakeholder_importance: response?.stakeholder_importance,
          business_impact: response?.business_impact,
          materiality_score: response?.materiality_score,
        };
      });

      setTopics(topicsWithScores);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
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
      const { data, error } = await supabase
        .from('esg_topics')
        .insert({
          project_id: projectId,
          category,
          name,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;

      setTopics(prev => [...prev, data]);
      toast.success('Topic added successfully');
      return data;
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error('Failed to add topic');
      return null;
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('esg_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.filter(t => t.id !== topicId));
      toast.success('Topic deleted');
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const saveSurveyResponse = async (
    topicId: string,
    stakeholderImportance: number,
    businessImpact: number
  ) => {
    if (!projectId) return null;

    try {
      // Check if response exists
      const { data: existing } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('topic_id', topicId)
        .maybeSingle();

      let response;
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('survey_responses')
          .update({
            stakeholder_importance: stakeholderImportance,
            business_impact: businessImpact,
          })
          .eq('topic_id', topicId)
          .select()
          .single();

        if (error) throw error;
        response = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('survey_responses')
          .insert({
            topic_id: topicId,
            project_id: projectId,
            stakeholder_importance: stakeholderImportance,
            business_impact: businessImpact,
          })
          .select()
          .single();

        if (error) throw error;
        response = data;
      }

      // Update local state
      setTopics(prev =>
        prev.map(t =>
          t.id === topicId
            ? {
                ...t,
                stakeholder_importance: response.stakeholder_importance,
                business_impact: response.business_impact,
                materiality_score: response.materiality_score,
              }
            : t
        )
      );

      toast.success('Response saved');
      return response;
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
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
