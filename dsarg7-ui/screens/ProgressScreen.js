import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Animated } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { getNext } from '../src/api/client';

export default function ProgressScreen() {
  const [masteryData, setMasteryData] = useState([]);
  const [aktTrend, setAktTrend] = useState([]);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const learnerId = 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch current recommendation to get mastery info
      const data = await getNext(learnerId);
      
      // Parse mastery from explanation or use mock data
      // In production, you'd have a dedicated /progress endpoint
      const mockMastery = [
        { concept: 'Loops', mastery: 0.8 },
        { concept: 'Functions', mastery: 0.6 },
        { concept: 'Variables', mastery: 0.9 },
        { concept: 'Conditionals', mastery: 0.65 },
      ];

      // AKT trend data (simulated - in production from backend)
      const mockTrend = [
        { day: 1, mastery: 0.5 },
        { day: 2, mastery: 0.55 },
        { day: 3, mastery: 0.6 },
        { day: 4, mastery: 0.65 },
        { day: 5, mastery: 0.7 },
        { day: 6, mastery: 0.72 },
        { day: 7, mastery: 0.75 },
      ];

      setMasteryData(mockMastery);
      setAktTrend(mockTrend);
      setEngagement({
        totalInteractions: 24,
        avgTimeSpent: 12.5,
        activeDays: 8,
        correctRate: 0.85,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
      // Use fallback data
      setMasteryData([
        { concept: 'Loops', mastery: 0.8 },
        { concept: 'Functions', mastery: 0.6 },
      ]);
      setAktTrend([
        { day: 1, mastery: 0.5 },
        { day: 2, mastery: 0.6 },
        { day: 3, mastery: 0.7 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderLineChart = () => {
    if (aktTrend.length === 0) return null;

    const chartWidth = 300;
    const chartHeight = 150;
    const padding = 20;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;

    const maxMastery = Math.max(...aktTrend.map(d => d.mastery), 1);
    const minMastery = Math.min(...aktTrend.map(d => d.mastery), 0);

    const points = aktTrend.map((d, idx) => {
      const x = padding + (idx / (aktTrend.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((d.mastery - minMastery) / (maxMastery - minMastery || 1)) * innerHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
            const y = padding + innerHeight - (val * innerHeight);
            return (
              <Line
                key={idx}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}
          
          {/* Trend line */}
          <Polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
          />
          
          {/* Data points */}
          {aktTrend.map((d, idx) => {
            const x = padding + (idx / (aktTrend.length - 1)) * innerWidth;
            const y = padding + innerHeight - ((d.mastery - minMastery) / (maxMastery - minMastery || 1)) * innerHeight;
            return (
              <Circle
                key={idx}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
              />
            );
          })}
        </Svg>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>Day</Text>
          <Text style={styles.chartLabel}>Mastery</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Your Progress</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skill Mastery (BKT)</Text>
        {masteryData.map((item, idx) => (
          <AnimatedSkillBar
            key={idx}
            concept={item.concept}
            mastery={item.mastery}
            delay={idx * 100}
          />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Learning Trajectory (AKT)</Text>
        {renderLineChart()}
        <Text style={styles.trendDescription}>
          Long-term learning pattern showing steady improvement
        </Text>
      </View>

      {engagement && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Engagement Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Interactions</Text>
            <Text style={styles.statValue}>{engagement.totalInteractions}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Avg Time Spent</Text>
            <Text style={styles.statValue}>{engagement.avgTimeSpent} min</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active Days</Text>
            <Text style={styles.statValue}>{engagement.activeDays} days</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Correct Rate</Text>
            <Text style={styles.statValue}>{(engagement.correctRate * 100).toFixed(0)}%</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function AnimatedSkillBar({ concept, mastery, delay = 0 }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: mastery,
      duration: 800,
      delay: delay,
      useNativeDriver: false,
    }).start();
  }, [mastery, delay]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.skillItem}>
      <Text style={styles.skillName}>{concept}</Text>
      <View style={styles.skillBar}>
        <Animated.View
          style={[
            styles.skillFill,
            { width: widthInterpolate },
          ]}
        />
      </View>
      <Text style={styles.skillValue}>{(mastery * 100).toFixed(0)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  skillItem: {
    marginBottom: 16,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  skillBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  skillValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  trendDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: '#999',
  },
  contentContainer: {
    paddingBottom: 20,
  },
});
