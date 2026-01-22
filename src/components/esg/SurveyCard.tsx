import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Leaf, Users, Building2 } from 'lucide-react';
import { TopicWithScore, ESGCategory, IMPORTANCE_LEVELS, IMPACT_LEVELS } from '@/types/esg';
import { cn } from '@/lib/utils';

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

interface SurveyCardProps {
  topic: TopicWithScore;
  onSave: (stakeholderImportance: number, businessImpact: number) => Promise<void>;
}

export function SurveyCard({ topic, onSave }: SurveyCardProps) {
  const [stakeholderImportance, setStakeholderImportance] = useState<number | null>(
    topic.stakeholder_importance ?? null
  );
  const [businessImpact, setBusinessImpact] = useState<number | null>(
    topic.business_impact ?? null
  );
  const [saving, setSaving] = useState(false);

  const Icon = CATEGORY_ICONS[topic.category as ESGCategory];
  const colorClass = CATEGORY_COLORS[topic.category as ESGCategory];

  // Auto-save when both values are selected
  useEffect(() => {
    if (stakeholderImportance !== null && businessImpact !== null) {
      // Only save if values changed
      if (
        stakeholderImportance !== topic.stakeholder_importance ||
        businessImpact !== topic.business_impact
      ) {
        setSaving(true);
        onSave(stakeholderImportance, businessImpact).finally(() => setSaving(false));
      }
    }
  }, [stakeholderImportance, businessImpact]);

  return (
    <Card className="overflow-hidden animate-slide-up">
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', colorClass)} />
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {topic.name}
            </h3>
            {topic.description && (
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            )}
          </div>
          {saving && (
            <span className="ml-auto text-xs text-muted-foreground">Saving...</span>
          )}
          {topic.materiality_score !== undefined && !saving && (
            <span className="ml-auto rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              Score: {topic.materiality_score}
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
  );
}
