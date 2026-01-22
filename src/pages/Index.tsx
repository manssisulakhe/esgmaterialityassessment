import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/esg/Header';
import { ProjectSelector } from '@/components/esg/ProjectSelector';
import { ESGCategorySection } from '@/components/esg/ESGCategorySection';
import { SurveyCard } from '@/components/esg/SurveyCard';
import { MaterialityMatrix } from '@/components/esg/MaterialityMatrix';
import { ResultsDashboard } from '@/components/esg/ResultsDashboard';
import { ExportTools } from '@/components/esg/ExportTools';
import { useProjects } from '@/hooks/useProjects';
import { useESGTopics } from '@/hooks/useESGTopics';
import { ESGCategory } from '@/types/esg';

const Index = () => {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    loading: projectsLoading,
  } = useProjects();

  const {
    topics,
    loading: topicsLoading,
    createTopic,
    deleteTopic,
    saveSurveyResponse,
    getTopicsByCategory,
    getScoredTopics,
  } = useESGTopics(activeProjectId);

  const [activeTab, setActiveTab] = useState('topics');

  if (projectsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Project Selector */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <ProjectSelector
            projects={projects}
            activeProject={activeProject}
            onSelectProject={setActiveProjectId}
            onCreateProject={createProject}
          />
          {activeProject && <ExportTools project={activeProject} topics={topics} />}
        </div>

        {!activeProject ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              Create a project to get started with your ESG assessment.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="topics">ESG Topics</TabsTrigger>
              <TabsTrigger value="survey">Survey</TabsTrigger>
              <TabsTrigger value="matrix">Matrix</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="topics" className="animate-fade-in">
              {topicsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                  {(['environmental', 'social', 'governance'] as ESGCategory[]).map(category => (
                    <ESGCategorySection
                      key={category}
                      category={category}
                      topics={getTopicsByCategory(category)}
                      onAddTopic={(name, description) => createTopic(category, name, description)}
                      onDeleteTopic={deleteTopic}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="survey" className="animate-fade-in">
              {topics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Add ESG topics first to start the survey.
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {topics.map(topic => (
                    <SurveyCard
                      key={topic.id}
                      topic={topic}
                      onSave={(si, bi) => saveSurveyResponse(topic.id, si, bi)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="matrix" className="animate-fade-in">
              <MaterialityMatrix topics={topics} />
            </TabsContent>

            <TabsContent value="results" className="animate-fade-in">
              <ResultsDashboard topics={topics} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
