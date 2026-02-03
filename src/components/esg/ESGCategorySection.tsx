import { useState } from 'react';
import { Plus, Leaf, Users, Building2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ESGCategory, TopicWithScore } from '@/types/esg';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG = {
  environmental: {
    icon: Leaf,
    label: 'Environmental',
    bgClass: 'bg-environmental-light',
    iconClass: 'text-environmental',
    borderClass: 'border-environmental/30',
  },
  social: {
    icon: Users,
    label: 'Social',
    bgClass: 'bg-social-light',
    iconClass: 'text-social',
    borderClass: 'border-social/30',
  },
  governance: {
    icon: Building2,
    label: 'Governance',
    bgClass: 'bg-governance-light',
    iconClass: 'text-governance',
    borderClass: 'border-governance/30',
  },
};

interface ESGCategorySectionProps {
  category: ESGCategory;
  topics: TopicWithScore[];
  onAddTopic: (name: string, description?: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
}

export function ESGCategorySection({
  category,
  topics,
  onAddTopic,
  onDeleteTopic,
}: ESGCategorySectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [adding, setAdding] = useState(false);

  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  const handleAddTopic = async () => {
    if (!topicName.trim()) return;

    setAdding(true);
    await onAddTopic(topicName.trim(), topicDescription.trim() || undefined);
    setTopicName('');
    setTopicDescription('');
    setDialogOpen(false);
    setAdding(false);
  };

  return (
    <>
      <Card className={cn('overflow-hidden border-2', config.borderClass)}>
        <div className={cn('p-4', config.bgClass)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-sm')}>
                <Icon className={cn('h-5 w-5', config.iconClass)} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {config.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {topics.length} topic{topics.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className={cn(
                'gap-1',
                category === 'environmental' && 'bg-environmental hover:bg-environmental/90',
                category === 'social' && 'bg-social hover:bg-social/90',
                category === 'governance' && 'bg-governance hover:bg-governance/90',
                'text-white'
              )}
            >
              <Plus className="h-4 w-4" />
              Add Topic
            </Button>
          </div>
        </div>

        <div className="p-4">
          {topics.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No topics added yet. Click "Add Topic" to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{topic.name}</p>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {topic.materiality_score !== undefined && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Score: {topic.materiality_score}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteTopic(topic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Icon className={cn('h-5 w-5', config.iconClass)} />
              Add {config.label} Topic
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Topic Name *</Label>
              <Input
                id="topic-name"
                placeholder="e.g., Carbon Emissions"
                value={topicName}
                onChange={e => setTopicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-description">Description (optional)</Label>
              <Textarea
                id="topic-description"
                placeholder="Brief description of the topic..."
                value={topicDescription}
                onChange={e => setTopicDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTopic}
              disabled={!topicName.trim() || adding}
              className={cn(
                category === 'environmental' && 'bg-environmental hover:bg-environmental/90',
                category === 'social' && 'bg-social hover:bg-social/90',
                category === 'governance' && 'bg-governance hover:bg-governance/90',
                'text-white'
              )}
            >
              {adding ? 'Adding...' : 'Add Topic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
