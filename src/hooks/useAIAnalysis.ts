import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useToast } from './use-toast';

export const useAIAnalysis = () => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel(
          import.meta.env.VITE_TENSORFLOW_MODEL_URL
        );
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading AI model:', error);
        toast({
          title: "AI Analysis Unavailable",
          description: "Could not load the AI analysis model. Some features may be limited.",
          variant: "destructive",
        });
      }
    };

    loadModel();
  }, []);

  const analyzeImage = async (imageUrl: string): Promise<string[]> => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    setIsLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();

      const predictions = await model.predict(tensor) as tf.Tensor;
      const data = await predictions.data();

      // Convert predictions to tags
      const tags = ['pothole', 'street_light', 'graffiti', 'garbage'];
      const results = tags.filter((_, i) => data[i] > 0.5);

      setIsLoading(false);
      return results;
    } catch (error) {
      setIsLoading(false);
      console.error('Error analyzing image:', error);
      throw error;
    }
  };

  return {
    analyzeImage,
    isLoading,
    isModelReady: !!model,
  };
};