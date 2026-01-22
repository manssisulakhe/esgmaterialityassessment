import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Building2, TrendingUp, Award, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { TopicWithScore, ESGCategory } from '@/types/esg';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';

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

interface ResultsDashboardProps {
  topics: TopicWithScore[];
}

export function ResultsDashboard({ topics }: ResultsDashboardProps) {
  const scoredTopics = useMemo(
    () => topics.filter(t => t.materiality_score !== undefined),
    [topics]
  );

  const topMaterialTopics = useMemo(
    () =>
      [...scoredTopics]
        .sort((a, b) => (b.materiality_score || 0) - (a.materiality_score || 0))
        .slice(0, 5),
    [scoredTopics]
  );

  const getPriorityLevel = (score: number) => {
    if (score >= 7) return { label: 'High', className: 'bg-priority-high text-white' };
    if (score >= 5) return { label: 'Medium', className: 'bg-priority-medium text-white' };
    return { label: 'Low', className: 'bg-priority-low text-white' };
  };

  const stats = useMemo(() => {
    const high = scoredTopics.filter(t => (t.materiality_score || 0) >= 7).length;
    const medium = scoredTopics.filter(
      t => (t.materiality_score || 0) >= 5 && (t.materiality_score || 0) < 7
    ).length;
    const low = scoredTopics.filter(t => (t.materiality_score || 0) < 5).length;
    const avgScore =
      scoredTopics.length > 0
        ? (
            scoredTopics.reduce((sum, t) => sum + (t.materiality_score || 0), 0) /
            scoredTopics.length
          ).toFixed(1)
        : '0';

    return { high, medium, low, avgScore, total: scoredTopics.length };
  }, [scoredTopics]);

  const scoreDistribution = useMemo(() => {
    const distribution = [
      { range: '2-3', label: 'Low', count: 0, fill: 'hsl(var(--priority-low))' },
      { range: '4-5', label: 'Medium-Low', count: 0, fill: 'hsl(var(--muted-foreground))' },
      { range: '5-6', label: 'Medium', count: 0, fill: 'hsl(var(--priority-medium))' },
      { range: '7-8', label: 'High', count: 0, fill: 'hsl(var(--priority-high))' },
    ];

    scoredTopics.forEach(t => {
      const score = t.materiality_score || 0;
      if (score <= 3) distribution[0].count++;
      else if (score <= 5) distribution[1].count++;
      else if (score <= 6) distribution[2].count++;
      else distribution[3].count++;
    });

    return distribution.filter(d => d.count > 0);
  }, [scoredTopics]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = {
      environmental: { name: 'Environmental', count: 0, avgScore: 0, fill: 'hsl(var(--environmental))' },
      social: { name: 'Social', count: 0, avgScore: 0, fill: 'hsl(var(--social))' },
      governance: { name: 'Governance', count: 0, avgScore: 0, fill: 'hsl(var(--governance))' },
    };

    scoredTopics.forEach(t => {
      const cat = t.category as ESGCategory;
      if (breakdown[cat]) {
        breakdown[cat].count++;
        breakdown[cat].avgScore += t.materiality_score || 0;
      }
    });

    return Object.values(breakdown)
      .filter(b => b.count > 0)
      .map(b => ({
        ...b,
        avgScore: b.count > 0 ? Number((b.avgScore / b.count).toFixed(1)) : 0,
      }));
  }, [scoredTopics]);

  const chartConfig: ChartConfig = {
    count: { label: 'Topics' },
    environmental: { label: 'Environmental', color: 'hsl(var(--environmental))' },
    social: { label: 'Social', color: 'hsl(var(--social))' },
    governance: { label: 'Governance', color: 'hsl(var(--governance))' },
  };

  if (scoredTopics.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            Complete the survey for your ESG topics to see results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessed</p>
                <p className="text-3xl font-bold font-display text-foreground">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-3xl font-bold font-display text-foreground">
                  {stats.avgScore}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold font-display text-priority-high">
                  {stats.high}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
                <p className="text-3xl font-bold font-display text-priority-medium">
                  {stats.medium}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-priority-medium" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Distribution Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scoreDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={scoreDistribution} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="label" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data to display</p>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <ChartContainer config={chartConfig} className="h-[200px] w-full max-w-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={categoryBreakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      strokeWidth={2}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.fill }}
                      />
                      <span className="text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground">({cat.count})</span>
                      <span className="text-muted-foreground">Avg: {cat.avgScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data to display</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Material Topics */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Top 5 Material Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMaterialTopics.map((topic, index) => {
              const Icon = CATEGORY_ICONS[topic.category as ESGCategory];
              const colorClass = CATEGORY_COLORS[topic.category as ESGCategory];
              const priority = getPriorityLevel(topic.materiality_score || 0);

              return (
                <div
                  key={topic.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <Icon className={cn('h-5 w-5', colorClass)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {topic.name}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {topic.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={priority.className}>{priority.label}</Badge>
                    <span className="text-lg font-bold text-foreground">
                      {topic.materiality_score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
