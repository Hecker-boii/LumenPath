import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getNext, interact } from '../src/api/client';
import RecommendationCard from '../components/RecommendationCard';

export default function LearnScreen() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const learner_id = 1; // Default learner ID

  useEffect(() => {
    fetchNext();
  }, []);

  const fetchNext = async () => {
    try {
      setLoading(true);
      const data = await getNext(learner_id);
      setRecommendation(data);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setRecommendation({
        concept: 'Error loading',
        activity: 'Try again',
        resource_id: 'N/A',
        confidence: 0,
        explanation: error.message || 'Unable to connect to server. Make sure the backend is running.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCompleted = async () => {
    if (!recommendation) return;
    
    try {
      setCompleting(true);
      await interact(
        learner_id,
        recommendation.concept || recommendation.resource_id,
        true,
        Math.floor(Math.random() * 60) + 10
      );
      // Refresh recommendation after interaction
      await fetchNext();
    } catch (error) {
      console.error('Error recording interaction:', error);
      alert('Failed to record interaction. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNext();
  };

  if (loading && !recommendation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading recommendation...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Continue Learning</Text>

      {recommendation && (
        <RecommendationCard
          concept={recommendation.concept}
          activity={recommendation.activity}
          confidence={recommendation.confidence}
          explanation={recommendation.explanation}
          onComplete={handleCompleted}
          completing={completing}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
