import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export default class NotificationService {
  static async registerForPushNotificationsAsync() {
    let token;
    
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('¡Necesitamos permisos para enviar recordatorios de tus citas!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
    } else {
      alert('Debes usar un dispositivo físico para recibir notificaciones push');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  static async scheduleAppointmentReminder(appointment) {
    // Programar recordatorio 24 horas antes
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 24);
    
    // Verificar que la fecha del recordatorio sea en el futuro
    if (reminderDate <= new Date()) {
      return null; // No programar si la fecha ya pasó
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de cita médica',
        body: `Tienes una cita mañana a las ${appointment.time}`,
        data: { appointmentId: appointment.id_ap },
      },
      trigger: reminderDate,
    });
    
    return notificationId;
  }

  static async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
} 