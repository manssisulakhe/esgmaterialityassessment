import { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Building2, Info } from 'lucide-react';
import { TopicWithScore, ESGCategory } from '@/types/esg';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS = {
  environmental: 'hsl(var(--environmental))',
  social: 'hsl(var(--social))',
  governance: 'hsl(var(--governance))',
};

const CATEGORY_ICONS = {
  environmental: Leaf,
  social: Users,
  governance: Building2,
};

interface PlottedTopic {
  id: string;
  name: string;
  category: ESGCategory;
  x: number;
  y: number;
  offsetX: number;
  score: number;
  stakeholder_importance: number;
  business_impact: number;
}

interface SelectedTopic {
  id: string;
  name: string;
  category: ESGCategory;
  score: number;
  stakeholder_importance: number;
  business_impact: number;
}

interface MaterialityMatrixProps {
  topics: TopicWithScore[];
}

export function MaterialityMatrix({ topics }: MaterialityMatrixProps) {
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);

  const scoredTopics = useMemo(
    () => topics.filter(t => t.materiality_score !== undefined),
    [topics]
  );

  // Create individual markers with horizontal offsets for overlapping topics
  const plottedData = useMemo(() => {
    // First, group by coordinates to calculate offsets
    const coordinateGroups: Record<string, TopicWithScore[]> = {};

    scoredTopics.forEach(topic => {
      const x = topic.business_impact || 0;
      const y = topic.stakeholder_importance || 0;
      const key = `${x}-${y}`;

      if (!coordinateGroups[key]) {
        coordinateGroups[key] = [];
      }
      coordinateGroups[key].push(topic);
    });

    // Now create individual plotted topics with offsets
    const result: PlottedTopic[] = [];

    Object.values(coordinateGroups).forEach(group => {
      const count = group.length;
      const offsetStep = 12; // pixels between markers
      const totalWidth = (count - 1) * offsetStep;
      const startOffset = -totalWidth / 2;

      group.forEach((topic, index) => {
        result.push({
          id: topic.id,
          name: topic.name,
          category: topic.category as ESGCategory,
          x: topic.business_impact || 0,
          y: topic.stakeholder_importance || 0,
          offsetX: startOffset + index * offsetStep,
          score: topic.materiality_score || 0,
          stakeholder_importance: topic.stakeholder_importance || 0,
          business_impact: topic.business_impact || 0,
        });
      });
    });

    return result;
  }, [scoredTopics]);

  const handleMarkerClick = (topic: PlottedTopic) => {
    setSelectedTopic(prev => 
      prev?.id === topic.id ? null : {
        id: topic.id,
        name: topic.name,
        category: topic.category,
        score: topic.score,
        stakeholder_importance: topic.stakeholder_importance,
        business_impact: topic.business_impact,
      }
    );
  };

  const CustomMarker = (props: any) => {
    const { cx, cy, payload } = props;
    const isSelected = selectedTopic?.id === payload.id;
    const baseRadius = 10;
    const radius = isSelected ? baseRadius + 3 : baseRadius;

    // Apply horizontal offset
    const adjustedCx = cx + payload.offsetX;

    // Color based on ESG category
    const fillColor = CATEGORY_COLORS[payload.category];

    return (
      <g 
        style={{ cursor: 'pointer' }}
        onClick={() => handleMarkerClick(payload)}
      >
        <circle
          cx={adjustedCx}
          cy={cy}
          r={radius}
          fill={fillColor}
          stroke={isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--background))'}
          strokeWidth={isSelected ? 3 : 2}
          opacity={0.9}
        />
      </g>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display">Materiality Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        {scoredTopics.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">
              Complete the survey for topics to see them plotted on the matrix.
            </p>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

                {/* High Materiality Zone */}
                <ReferenceArea
                  x1={2.5}
                  x2={4.2}
                  y1={2.5}
                  y2={4.2}
                  fill="hsl(var(--material-zone))"
                  fillOpacity={0.15}
                  stroke="hsl(var(--material-zone))"
                  strokeOpacity={0.3}
                  label={{
                    value: 'Highly Material',
                    position: 'insideTopRight',
                    fill: 'hsl(var(--material-zone))',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <XAxis
                  type="number"
                  dataKey="x"
                  name="Business Impact"
                  domain={[0.5, 4.5]}
                  ticks={[1, 2, 3, 4]}
                  label={{
                    value: 'Impact on Business',
                    position: 'bottom',
                    offset: 20,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                  stroke="hsl(var(--border))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Stakeholder Importance"
                  domain={[0.5, 4.5]}
                  ticks={[1, 2, 3, 4]}
                  label={{
                    value: 'Importance to Stakeholders',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                  stroke="hsl(var(--border))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />

                <Scatter
                  name="Topics"
                  data={plottedData}
                  shape={<CustomMarker />}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-environmental" />
            <span className="text-sm text-muted-foreground">Environmental</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-social" />
            <span className="text-sm text-muted-foreground">Social</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-governance" />
            <span className="text-sm text-muted-foreground">Governance</span>
          </div>
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Multiple ESG topics with identical scores are grouped and shown interactively upon selection.
          </p>
        </div>

        {/* Selected Topic Details Panel */}
        {selectedTopic && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                Selected Topic Details
              </h4>
              <Badge variant="secondary" className="capitalize">{selectedTopic.category}</Badge>
            </div>
            <div className="flex items-center gap-4 rounded-md border border-border bg-muted/30 p-3">
              {(() => {
                const Icon = CATEGORY_ICONS[selectedTopic.category];
                return <Icon className={cn('h-5 w-5 flex-shrink-0', `text-${selectedTopic.category}`)} />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{selectedTopic.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{selectedTopic.category}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Stakeholder</p>
                  <p className="font-medium text-foreground">{selectedTopic.stakeholder_importance}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Business</p>
                  <p className="font-medium text-foreground">{selectedTopic.business_impact}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-bold text-primary">{selectedTopic.score}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
