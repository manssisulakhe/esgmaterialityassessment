import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Leaf, Users, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TopicWithScore, ESGCategory, IMPORTANCE_LEVELS, IMPACT_LEVELS } from '@/types/esg';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  environmental: Leaf,
  social: Users,
  governance: Building2,
};

const CATEGORY_COLORS = {
  environmental: 'text-environmental',
  social: 'text-social',
  governance: 'text-governance',
};

interface ScoreCardProps {
  value: number;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function ScoreCard({ value, label, description, selected, onClick }: ScoreCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all',
        'hover:border-primary hover:shadow-md',
        selected
          ? 'border-primary bg-primary/10 shadow-md'
          : 'border-border bg-card hover:bg-accent/50'
      )}
    >
      <span
        className={cn(
          'text-2xl font-bold',
          selected ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          'font-medium',
          selected ? 'text-primary' : 'text-foreground'
        )}
      >
        {label}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

interface SurveyViewProps {
  topics: TopicWithScore[];
  onSave: (topicId: string, stakeholderImportance: number, businessImpact: number) => Promise<any>;
  onNavigateToMatrix: () => void;
}

export function SurveyView({ topics, onSave, onNavigateToMatrix }: SurveyViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stakeholderImportance, setStakeholderImportance] = useState<number | null>(null);
  const [businessImpact, setBusinessImpact] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentTopic = topics[currentIndex];
  const isLastTopic = currentIndex === topics.length - 1;

  // Reset form when topic changes and load existing values
  useEffect(() => {
    if (currentTopic) {
      setStakeholderImportance(currentTopic.stakeholder_importance ?? null);
      setBusinessImpact(currentTopic.business_impact ?? null);
    }
  }, [currentTopic?.id]);

  if (topics.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Add ESG topics first to start the survey.
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[currentTopic.category as ESGCategory];
  const colorClass = CATEGORY_COLORS[currentTopic.category as ESGCategory];

  const handleSubmit = async () => {
    // Validate both questions are answered
    if (stakeholderImportance === null) {
      toast.error('Please select stakeholder importance');
      return;
    }
    if (businessImpact === null) {
      toast.error('Please select business impact');
      return;
    }

    setSubmitting(true);
    try {
      // Save the survey response (total_score calculated in backend/hook)
      const result = await onSave(currentTopic.id, stakeholderImportance, businessImpact);
      
      if (result) {
        toast.success('Survey response saved successfully');
        
        // Navigate to next topic or Matrix tab
        if (isLastTopic) {
          onNavigateToMatrix();
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to save survey response');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < topics.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Topic {currentIndex + 1} of {topics.length}
        </span>
        <div className="flex gap-1">
          {topics.map((topic, idx) => (
            <button
              key={topic.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentIndex
                  ? 'bg-primary w-4'
                  : topic.materiality_score !== undefined
                  ? 'bg-primary/50'
                  : 'bg-muted-foreground/30'
              )}
              aria-label={`Go to topic ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Survey Card */}
      <Card className="overflow-hidden animate-slide-up">
        <div className="border-b border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Icon className={cn('h-5 w-5', colorClass)} />
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {currentTopic.name}
              </h3>
              {currentTopic.description && (
                <p className="text-sm text-muted-foreground">{currentTopic.description}</p>
              )}
            </div>
            {currentTopic.materiality_score !== undefined && (
              <span className="ml-auto rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                Score: {currentTopic.materiality_score}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Stakeholder Importance */}
          <div>
            <h4 className="mb-3 font-medium text-foreground">
              How important is this topic to your stakeholders?
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {IMPORTANCE_LEVELS.map(level => (
                <ScoreCard
                  key={level.value}
                  value={level.value}
                  label={level.label}
                  description={level.description}
                  selected={stakeholderImportance === level.value}
                  onClick={() => setStakeholderImportance(level.value)}
                />
              ))}
            </div>
          </div>

          {/* Business Impact */}
          <div>
            <h4 className="mb-3 font-medium text-foreground">
              What is the impact of this topic on your business?
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {IMPACT_LEVELS.map(level => (
                <ScoreCard
                  key={level.value}
                  value={level.value}
                  label={level.label}
                  description={level.description}
                  selected={businessImpact === level.value}
                  onClick={() => setBusinessImpact(level.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation and Submit */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastTopic && (
            <Button
              variant="ghost"
              onClick={handleNext}
            >
              Skip
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isLastTopic ? 'Submit & View Matrix' : 'Submit Survey'}
          </Button>
        </div>
      </div>
    </div>
  );
}
