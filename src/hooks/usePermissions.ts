import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export const usePermissions = () => {
  const [locationPermission, setLocationPermission] = useState<PermissionState>('prompt');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    const checkPermissions = async () => {
      // Check location permission
      try {
        const locationStatus = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(locationStatus.state);
        
        locationStatus.addEventListener('change', () => {
          setLocationPermission(locationStatus.state);
        });
      } catch (error) {
        console.error('Error checking location permission:', error);
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    checkPermissions();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      toast({
        title: "Location Access Granted",
        description: "We can now show you nearby issues and improve location accuracy.",
      });
      
      return position;
    } catch (error) {
      toast({
        title: "Location Access Denied",
        description: "Please enable location access to use all features.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive updates about your reported issues.",
        });
        return true;
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You won't receive updates about your reported issues.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  return {
    locationPermission,
    notificationPermission,
    requestLocationPermission,
    requestNotificationPermission,
  };
};