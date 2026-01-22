import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TopicWithScore, ESGCategory } from '@/types/esg';

const CATEGORY_COLORS = {
  environmental: '#2d9d5f',
  social: '#3b82f6',
  governance: '#7c3aed',
};

interface MaterialityMatrixProps {
  topics: TopicWithScore[];
}

export function MaterialityMatrix({ topics }: MaterialityMatrixProps) {
  const scoredTopics = useMemo(
    () => topics.filter(t => t.materiality_score !== undefined),
    [topics]
  );

  const data = useMemo(
    () =>
      scoredTopics.map(topic => ({
        x: topic.business_impact || 0,
        y: topic.stakeholder_importance || 0,
        name: topic.name,
        category: topic.category,
        score: topic.materiality_score,
      })),
    [scoredTopics]
  );

  const environmentalData = data.filter(d => d.category === 'environmental');
  const socialData = data.filter(d => d.category === 'social');
  const governanceData = data.filter(d => d.category === 'governance');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Stakeholder Importance: {item.y}</p>
            <p>Business Impact: {item.x}</p>
            <p className="font-medium text-primary">
              Materiality Score: {item.score}
            </p>
          </div>
        </div>
      );
    }
    return null;
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

                <Tooltip content={<CustomTooltip />} />

                <Scatter
                  name="Environmental"
                  data={environmentalData}
                  fill={CATEGORY_COLORS.environmental}
                  shape="circle"
                />
                <Scatter
                  name="Social"
                  data={socialData}
                  fill={CATEGORY_COLORS.social}
                  shape="circle"
                />
                <Scatter
                  name="Governance"
                  data={governanceData}
                  fill={CATEGORY_COLORS.governance}
                  shape="circle"
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
      </CardContent>
    </Card>
  );
}
