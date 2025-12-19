import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { getNext } from '../src/api/client';

export default function InsightsScreen() {
  const [riskLevel, setRiskLevel] = useState(0); // 0-100
  const [riskCategory, setRiskCategory] = useState('Low');
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(true);
  const learnerId = 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getNext(learnerId);
      
      // Extract risk from explanation or use mock data
      // In production, you'd have a dedicated /insights endpoint
      const mockRiskScore = 0.15; // 15% risk
      const mockRiskCategory = mockRiskScore < 0.3 ? 'Low' : mockRiskScore < 0.7 ? 'Medium' : 'High';
      
      setRiskLevel(mockRiskScore * 100);
      setRiskCategory(mockRiskCategory);
      setExplanations([
        'Low engagement in previous week',
        'Struggled with Loops concept',
        'Frequent skipping of quizzes',
        'Average time spent below threshold',
      ]);
    } catch (error) {
      console.error('Error loading insights:', error);
      setRiskLevel(20);
      setRiskCategory('Low');
      setExplanations(['Unable to load risk factors']);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    if (level > 70) return '#ef4444'; // High - Red
    if (level > 40) return '#f59e0b'; // Medium - Orange
    return '#10b981'; // Low - Green
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
      <Text style={styles.header}>Insights & Risk</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Predicted Risk</Text>
        <View style={styles.riskGaugeContainer}>
          <AnimatedCircularProgress
            size={150}
            width={15}
            fill={riskLevel}
            tintColor={getRiskColor(riskLevel)}
            backgroundColor="#e5e7eb"
            rotation={0}
            lineCap="round"
          >
            {() => (
              <View style={styles.gaugeContent}>
                <Text style={[styles.riskCategoryText, { color: getRiskColor(riskLevel) }]}>
                  {riskCategory}
                </Text>
                <Text style={styles.riskScoreText}>
                  {riskLevel.toFixed(0)}%
                </Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>
        <Text style={styles.riskDescription}>
          Based on your engagement and mastery trends, you are at {riskCategory.toLowerCase()} risk of struggling.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Key Factors (SHAP)</Text>
        {explanations.map((exp, idx) => (
          <View key={idx} style={styles.factorItem}>
            <Text style={styles.factorIcon}>•</Text>
            <Text style={styles.factorText}>{exp}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>XGBoost Risk Score</Text>
        <View style={styles.scoreBarContainer}>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreFill,
                {
                  width: `${riskLevel}%`,
                  backgroundColor: getRiskColor(riskLevel),
                },
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>
            {riskLevel.toFixed(1)}% ({riskCategory})
          </Text>
        </View>
        <Text style={styles.scoreDescription}>
          Machine learning model prediction based on engagement patterns, mastery trends, and interaction history.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <Text style={styles.recommendationText}>
          💡 {riskCategory === 'Low' 
            ? 'Keep up the great work! Your learning trajectory is strong.'
            : riskCategory === 'Medium'
            ? 'Focus on consistent practice. Review concepts where mastery is below 70%.'
            : 'Consider additional support. Focus on foundational concepts and maintain regular engagement.'}
        </Text>
      </View>
    </ScrollView>
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
    marginBottom: 12,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  riskGaugeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gaugeContent: {
    alignItems: 'center',
  },
  riskCategoryText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskScoreText: {
    fontSize: 14,
    color: '#666',
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
  },
  factorItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  factorIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
    color: '#666',
  },
  factorText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  scoreBarContainer: {
    marginTop: 8,
  },
  scoreBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 6,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
});
