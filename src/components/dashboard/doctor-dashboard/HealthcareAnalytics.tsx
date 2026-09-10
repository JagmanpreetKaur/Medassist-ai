/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  RefreshCw,
  Filter,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  totalAssessments: number;
  mostPredictedDisease: string | null;
  averageConfidence: number;
  highRisk: number;
  moderateRisk: number;
  lowRisk: number;
  diseaseDistribution: { name: string; value: number }[];
  riskDistribution: { name: string; value: number }[];
  confidenceDistribution: { name: string; value: number }[];
  symptomDistribution: { name: string; value: number }[];
  highRiskCases: any[];
}

interface TrendsData {
  diseaseTrends: any[];
  riskTrends: any[];
  assessmentTrends: any[];
  confidenceTrends: any[];
}

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#64748b", "#ec4899", "#8b5cf6"];
const RISK_COLORS: Record<string, string> = {
  "High Risk": "#ef4444",
  "Moderate Risk": "#f59e0b",
  "Low Risk": "#10b981",
};

export default function HealthcareAnalytics({
  onOpenAdvisory,
}: {
  onOpenAdvisory: (patient: any, report: any, index: number) => void;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeRange, setTimeRange] = useState("30");
  const [granularity, setGranularity] = useState("daily");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      // Fetch base analytics
      const baseRes = await fetch(`${API_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch trends with filters
      const queryParams = new URLSearchParams({
        granularity,
        timeRange,
        ...(diseaseFilter !== "all" && { disease: diseaseFilter }),
        ...(riskFilter !== "all" && { riskLevel: riskFilter }),
      });

      const trendsRes = await fetch(`${API_URL}/api/analytics/trends?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (baseRes.ok && trendsRes.ok) {
        setData(await baseRes.json());
        setTrends(await trendsRes.json());
      } else {
        toast.error("Unable to load healthcare analytics.");
      }
    } catch (err) {
      toast.error("Network error while fetching analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, granularity, diseaseFilter, riskFilter]); // Refetch when filters change

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Aggregating Population Health Data...</p>
      </div>
    );
  }

  if (!data || !trends) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>No health assessments available yet or unable to fetch data.</p>
        <Button onClick={fetchAnalytics} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            Healthcare Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated population insights and clinical trends
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100 dark:border-slate-800">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Filters</span>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] h-9 text-xs border-none bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-0">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger className="w-[110px] h-9 text-xs border-none bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-0">
              <SelectValue placeholder="Grouping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs border-none bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-0">
              <SelectValue placeholder="Disease" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diseases</SelectItem>
              {data.diseaseDistribution.map((d, i) => (
                <SelectItem key={i} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs border-none bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-0">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="High Risk">High Risk</SelectItem>
              <SelectItem value="Moderate Risk">Moderate Risk</SelectItem>
              <SelectItem value="Low Risk">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-apple shadow-apple rounded-[20px] p-5 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Assessments</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">
                {data.totalAssessments}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="border-apple shadow-apple rounded-[20px] p-5 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-50 dark:bg-rose-950/50 rounded-xl flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Most Predicted</p>
              <h4
                className="text-sm font-black text-slate-800 dark:text-white line-clamp-1 break-all"
                title={data.mostPredictedDisease || "N/A"}
              >
                {data.mostPredictedDisease || "N/A"}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="border-apple shadow-apple rounded-[20px] p-5 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Avg Confidence</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">
                {data.averageConfidence}%
              </h4>
            </div>
          </div>
        </Card>

        <Card className="border-apple shadow-apple rounded-[20px] p-5 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Risk Cases</p>
              <div className="flex gap-2 text-xs font-bold mt-1">
                <span className="text-rose-500" title="High Risk">
                  {data.highRisk}
                </span>{" "}
                /
                <span className="text-amber-500" title="Moderate Risk">
                  {" "}
                  {data.moderateRisk}
                </span>{" "}
                /
                <span className="text-emerald-500" title="Low Risk">
                  {" "}
                  {data.lowRisk}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {data.totalAssessments > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disease Trends */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                  Disease Prediction Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  Frequency of predictions over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                {trends.diseaseTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trends.diseaseTrends}
                      margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        minTickGap={30}
                      />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      {/* Extract top 5 diseases dynamically from the chart data */}
                      {Array.from(new Set(trends.diseaseTrends.flatMap(Object.keys)))
                        .filter((k) => k !== "date")
                        .slice(0, 5)
                        .map((diseaseName, i) => (
                          <Line
                            key={diseaseName}
                            type="monotone"
                            dataKey={diseaseName}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No disease trend data for this period.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Trends */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
                  Risk Level Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution of risk classifications over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                {trends.riskTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trends.riskTrends}
                      margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        minTickGap={30}
                      />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Line
                        type="monotone"
                        dataKey="High"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Moderate"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Low"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No risk trend data for this period.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Volume Trend */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                  Assessment Volume
                </CardTitle>
                <CardDescription className="text-xs">
                  Total number of AI assessments performed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trends.assessmentTrends}
                    margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      minTickGap={30}
                    />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="Volume" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assessments" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Trend */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  Average Prediction Confidence
                </CardTitle>
                <CardDescription className="text-xs">
                  Model confidence over time (not medical certainty)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trends.confidenceTrends}
                    margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      minTickGap={30}
                    />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="AverageConfidence"
                      name="Avg Confidence %"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Disease Distribution Pie Chart */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <Activity className="h-4.5 w-4.5 text-blue-500" />
                  Disease Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Percentage breakdown of AI-predicted conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                {data.diseaseDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={data.diseaseDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.diseaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No disease data available.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Distribution Pie Chart */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
                  Risk Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Proportion of high, moderate, and low risk assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                {data.riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={data.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.riskDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={RISK_COLORS[entry.name] || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No risk data available.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Symptom Distribution Bar Chart */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <Users className="h-4.5 w-4.5 text-indigo-500" />
                  Top Reported Symptoms
                </CardTitle>
                <CardDescription className="text-xs">
                  Most frequently logged symptoms across all assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                {data.symptomDistribution && data.symptomDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.symptomDistribution}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        width={80}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#6366f1"
                        radius={[0, 4, 4, 0]}
                        name="Occurrences"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No symptom data available.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confidence Distribution Bar Chart */}
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-white">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  Confidence Ranges
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution of AI prediction confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                {data.confidenceDistribution && data.confidenceDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.confidenceDistribution}
                      margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        name="Assessments"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No confidence data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* High-Risk Cases Table */}
          <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden mt-6">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-855 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                  High-Risk Cases Monitor
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Assessments flagged as High Risk requiring immediate attention
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-855 text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-5 py-4">Patient</th>
                    <th className="px-5 py-4">Disease</th>
                    <th className="px-4 py-4 text-center">Confidence</th>
                    <th className="px-4 py-4 text-center">Severity</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {data.highRiskCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400 italic">
                        No high-risk cases detected.
                      </td>
                    </tr>
                  ) : (
                    data.highRiskCases.map((caseData) => (
                      <tr
                        key={caseData.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-850/30 transition-all"
                      >
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-855 dark:text-white truncate">
                            {caseData.patient_name}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {caseData.condition}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">
                            {caseData.confidence}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-xs font-semibold text-rose-600">
                          {caseData.severity}
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-550 font-mono">
                          {caseData.date || "Unknown"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const minimalPatient = {
                                _id: caseData.patient_id,
                                name: caseData.patient_name,
                                medicalHistory: [caseData.report],
                              };
                              onOpenAdvisory(minimalPatient, caseData.report, 0);
                            }}
                            className="h-8 rounded-xl text-xs font-semibold border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">
          More assessment data is required to display meaningful trends and distribution charts.
        </div>
      )}
    </div>
  );
}
