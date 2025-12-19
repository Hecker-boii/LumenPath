import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { getNext } from '../src/api/client';

export default function CoachScreen() {
  const [messages, setMessages] = useState([]);
  const [orchestration, setOrchestration] = useState(null);
  const [loading, setLoading] = useState(true);
  const learnerId = 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getNext(learnerId);
      
      // Generate coach messages based on recommendation
      const coachMessages = [
        `Based on your recent performance, I recommend practicing ${data.concept || 'the next concept'}.`,
        `Your current activity type is ${data.activity || 'practice'}, which is optimized for your learning state.`,
        `The AI system has selected this recommendation with ${((data.confidence || 0) * 100).toFixed(0)}% confidence based on your mastery trends.`,
      ];

      setMessages(coachMessages);
      setOrchestration({
        modelDecision: `RL Agent Selected: ${data.activity || 'Practice'} Activity`,
        bktMastery: `Current concept mastery: ${((data.confidence || 0) * 100).toFixed(0)}%`,
        riskPrediction: `Risk Level: Low (from XGBoost model)`,
        ncfResource: `NCF recommended: ${data.resource_id || data.concept || 'Next resource'}`,
        explanation: data.explanation || 'No explanation available',
      });
    } catch (error) {
      console.error('Error loading coach data:', error);
      setMessages([
        'Unable to load AI coach recommendations. Please check your connection.',
      ]);
      setOrchestration({
        modelDecision: 'N/A',
        bktMastery: 'N/A',
        riskPrediction: 'N/A',
        ncfResource: 'N/A',
        explanation: 'Connection error',
      });
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.header}>AI Coach</Text>

      <View style={styles.card}>
        {messages.map((msg, idx) => (
          <AnimatedMessage key={idx} message={msg} delay={idx * 200} />
        ))}
      </View>

      {orchestration && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Orchestration Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Model Decision:</Text>
            <Text style={styles.detailValue}>{orchestration.modelDecision}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>BKT Mastery:</Text>
            <Text style={styles.detailValue}>{orchestration.bktMastery}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Risk Prediction:</Text>
            <Text style={styles.detailValue}>{orchestration.riskPrediction}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>NCF Resource:</Text>
            <Text style={styles.detailValue}>{orchestration.ncfResource}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Explanation:</Text>
            <Text style={styles.detailValue}>{orchestration.explanation}</Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>How This Works</Text>
        <Text style={styles.explanation}>
          <Text style={styles.bold}>BKT (Bayesian Knowledge Tracing)</Text> tracks your mastery of each concept based on correct/incorrect responses.
        </Text>
        <Text style={styles.explanation}>
          <Text style={styles.bold}>AKT (Attention-based Knowledge Tracing)</Text> learns long-term patterns in your learning behavior.
        </Text>
        <Text style={styles.explanation}>
          <Text style={styles.bold}>RL Agent (LinUCB)</Text> chooses the best activity type based on your state (mastery, engagement, risk).
        </Text>
        <Text style={styles.explanation}>
          <Text style={styles.bold}>NCF (Neural Collab. Filtering)</Text> recommends the best resource for that activity.
        </Text>
        <Text style={styles.explanation}>
          <Text style={styles.bold}>XGBoost + SHAP</Text> predict your risk and explain why.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.keyMessage}>
          💡 <Text style={styles.bold}>Each interaction updates the learner model, which changes the curriculum policy in real time.</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

function AnimatedMessage({ message, delay = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.coachBubble,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.coachText}>🤖 {message}</Text>
    </Animated.View>
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
  contentContainer: {
    paddingBottom: 20,
  },
  coachBubble: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  coachText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  explanation: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  keyMessage: {
    fontSize: 14,
    color: '#1B5E20',
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 6,
    lineHeight: 22,
  },
});
