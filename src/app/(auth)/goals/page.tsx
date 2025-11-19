'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Logo } from '@/components/logo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  TrendingUp,
  Home,
  Activity,
  Dumbbell,
  Settings,
  LogOut,
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  deadline: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GoalStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}

export default function GoalsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats>({
    total: 0,
    active: 0,
    completed: 0,
    completionRate: 0,
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  // Create goal modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: 'sessions',
    deadline: '',
  });

  // Edit goal modal state
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth');
      return;
    }
    setIsAuthenticated(true);
    fetchGoals();
  }, [filter, router]);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/goals?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          router.push('/auth');
          return;
        }
        throw new Error('Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data.goals);
      setStats(data.stats);
    } catch (error) {
      console.error('Goals fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description || null,
          targetValue: newGoal.targetValue ? parseFloat(newGoal.targetValue) : null,
          unit: newGoal.unit,
          deadline: newGoal.deadline || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      // Reset form
      setNewGoal({
        title: '',
        description: '',
        targetValue: '',
        unit: 'sessions',
        deadline: '',
      });
      setIsCreateModalOpen(false);

      // Refresh goals
      fetchGoals();
    } catch (error) {
      console.error('Create goal error:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      // Refresh goals
      fetchGoals();
    } catch (error) {
      console.error('Update goal error:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      // Refresh goals
      fetchGoals();
    } catch (error) {
      console.error('Delete goal error:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    await handleUpdateGoal(goal.id, { isCompleted: !goal.isCompleted });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  const calculateProgress = (goal: Goal): number => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  };

  const isOverdue = (deadline: string | null): boolean => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" />
              <div className="ml-10 flex items-baseline space-x-4">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/dashboard">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/insights">
                    <Activity className="w-4 h-4 mr-2" />
                    Insights
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/exercises">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Exercises
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">
                  <Target className="w-4 h-4 mr-2" />
                  Goals
                </Button>
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Goals</h1>
              <p className="text-gray-600 dark:text-gray-400">Set and track your posture improvement goals</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">Create New Goal</DialogTitle>
                  <DialogDescription className="dark:text-gray-400">
                    Set a new goal to track your posture improvement journey
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="dark:text-gray-200">Goal Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete 30 sessions this month"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-gray-200">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your goal..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetValue" className="dark:text-gray-200">Target Value</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        placeholder="30"
                        value={newGoal.targetValue}
                        onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                        className="dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="dark:text-gray-200">Unit</Label>
                      <Select value={newGoal.unit} onValueChange={(value) => setNewGoal({ ...newGoal, unit: value })}>
                        <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800">
                          <SelectItem value="sessions">Sessions</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                          <SelectItem value="breaks">Breaks</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="dark:text-gray-200">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="dark:bg-gray-800 dark:text-gray-100">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal} disabled={!newGoal.title}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold dark:text-gray-100">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-500">{stats.completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="dark:bg-gray-800 dark:text-gray-100"
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className="dark:bg-gray-800 dark:text-gray-100"
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className="dark:bg-gray-800 dark:text-gray-100"
          >
            Completed
          </Button>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="py-8">
                <p className="text-center text-gray-600 dark:text-gray-400">Loading goals...</p>
              </CardContent>
            </Card>
          ) : goals.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No goals yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first goal to start tracking your progress
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal);
              const overdue = isOverdue(goal.deadline);

              return (
                <Card key={goal.id} className={`dark:bg-gray-900 dark:border-gray-800 ${goal.isCompleted ? 'opacity-75' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleComplete(goal)}
                          className="mt-1"
                        >
                          {goal.isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <CardTitle className={`text-xl ${goal.isCompleted ? 'line-through text-gray-500 dark:text-gray-600' : 'dark:text-gray-100'}`}>
                            {goal.title}
                          </CardTitle>
                          {goal.description && (
                            <CardDescription className="mt-1 dark:text-gray-400">{goal.description}</CardDescription>
                          )}
                          <div className="flex gap-2 mt-2">
                            {goal.isCompleted && (
                              <Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400">Completed</Badge>
                            )}
                            {goal.deadline && (
                              <Badge variant={overdue && !goal.isCompleted ? 'destructive' : 'secondary'} className="dark:bg-gray-800">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(goal.deadline).toLocaleDateString()}
                                {overdue && !goal.isCompleted && ' (Overdue)'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="dark:text-gray-400 dark:hover:text-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {goal.targetValue && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium dark:text-gray-300">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                          <span>{Math.round(progress)}% complete</span>
                          {!goal.isCompleted && goal.targetValue && (
                            <span>{goal.targetValue - goal.currentValue} {goal.unit} remaining</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
