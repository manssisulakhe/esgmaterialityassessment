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

interface GroupedTopic {
  x: number;
  y: number;
  topics: {
    id: string;
    name: string;
    category: ESGCategory;
    score: number;
    stakeholder_importance: number;
    business_impact: number;
  }[];
  count: number;
  primaryCategory: ESGCategory;
}

interface MaterialityMatrixProps {
  topics: TopicWithScore[];
}

export function MaterialityMatrix({ topics }: MaterialityMatrixProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupedTopic | null>(null);

  const scoredTopics = useMemo(
    () => topics.filter(t => t.materiality_score !== undefined),
    [topics]
  );

  // Group topics by their x,y coordinates
  const groupedData = useMemo(() => {
    const groups: Record<string, GroupedTopic> = {};

    scoredTopics.forEach(topic => {
      const x = topic.business_impact || 0;
      const y = topic.stakeholder_importance || 0;
      const key = `${x}-${y}`;

      if (!groups[key]) {
        groups[key] = {
          x,
          y,
          topics: [],
          count: 0,
          primaryCategory: topic.category as ESGCategory,
        };
      }

      groups[key].topics.push({
        id: topic.id,
        name: topic.name,
        category: topic.category as ESGCategory,
        score: topic.materiality_score || 0,
        stakeholder_importance: y,
        business_impact: x,
      });
      groups[key].count++;
    });

    return Object.values(groups);
  }, [scoredTopics]);

  const handleMarkerClick = (data: GroupedTopic) => {
    setSelectedGroup(prev => 
      prev?.x === data.x && prev?.y === data.y ? null : data
    );
  };

  const CustomMarker = (props: any) => {
    const { cx, cy, payload } = props;
    const count = payload.count;
    const isSelected = selectedGroup?.x === payload.x && selectedGroup?.y === payload.y;
    const baseRadius = count > 1 ? 14 : 10;
    const radius = isSelected ? baseRadius + 4 : baseRadius;

    // Determine color based on primary category or mixed
    let fillColor = CATEGORY_COLORS[payload.primaryCategory];
    if (count > 1) {
      const categories = new Set(payload.topics.map((t: any) => t.category));
      if (categories.size > 1) {
        fillColor = 'hsl(var(--primary))';
      }
    }

    return (
      <g 
        style={{ cursor: 'pointer' }}
        onClick={() => handleMarkerClick(payload)}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={fillColor}
          stroke={isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--background))'}
          strokeWidth={isSelected ? 3 : 2}
          opacity={0.9}
        />
        {count > 1 && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={10}
            fontWeight="bold"
          >
            {count}
          </text>
        )}
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
                  data={groupedData}
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

        {/* Selected Group Details Panel */}
        {selectedGroup && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                Topics at Position ({selectedGroup.x}, {selectedGroup.y})
              </h4>
              <Badge variant="secondary">{selectedGroup.count} topic{selectedGroup.count > 1 ? 's' : ''}</Badge>
            </div>
            <div className="space-y-3">
              {selectedGroup.topics.map(topic => {
                const Icon = CATEGORY_ICONS[topic.category];
                return (
                  <div
                    key={topic.id}
                    className="flex items-center gap-4 rounded-md border border-border bg-muted/30 p-3"
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', `text-${topic.category}`)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{topic.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{topic.category}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Stakeholder</p>
                        <p className="font-medium text-foreground">{topic.stakeholder_importance}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Business</p>
                        <p className="font-medium text-foreground">{topic.business_impact}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="font-bold text-primary">{topic.score}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
