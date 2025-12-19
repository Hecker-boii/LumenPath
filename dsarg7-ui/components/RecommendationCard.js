import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

export default function RecommendationCard({ concept, activity, confidence, explanation, onComplete, completing }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: confidence || 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const widthInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recommended Next:</Text>
      <Text style={styles.concept}>{concept || 'Loading...'}</Text>
      <Text style={styles.activity}>{activity || 'N/A'}</Text>
      
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBar}>
          <Animated.View
            style={[
              styles.confidenceFill,
              { width: widthInterpolate },
            ]}
          />
        </View>
        <Text style={styles.confidenceText}>
          Confidence: {((confidence || 0) * 100).toFixed(0)}%
        </Text>
      </View>

      <Text style={styles.explanationLabel}>Explanation:</Text>
      <Text style={styles.explanation}>{explanation || 'No explanation available'}</Text>

      <TouchableOpacity
        style={[styles.button, completing && styles.buttonDisabled]}
        onPress={onComplete}
        disabled={completing}
      >
        <Text style={styles.buttonText}>
          {completing ? 'Recording...' : 'I completed this'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  concept: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
    marginVertical: 8,
  },
  activity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  confidenceContainer: {
    marginVertical: 12,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

