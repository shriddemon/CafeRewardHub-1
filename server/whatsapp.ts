// WhatsApp notification service using the WhatsApp Business API

type NotificationType = 'points_earned' | 'reward_earned' | 'order_completed' | 'game_reminder';

interface NotificationParams {
  [key: string]: string;
}

// Initialize WhatsApp settings - in a real app this would connect to actual WhatsApp Business API
export function setupWhatsAppNotifications() {
  console.log("WhatsApp notification service initialized");
  
  // In a real app, you would:
  // 1. Initialize the WhatsApp Business API client
  // 2. Set up authentication
  // 3. Register notification templates
}

// Send WhatsApp notification to a customer
export async function sendWhatsAppNotification(
  phoneNumber: string,
  notificationType: NotificationType,
  params: NotificationParams
) {
  // In a development environment, just log the notification
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[WhatsApp Notification to ${phoneNumber}]`);
    console.log(`Type: ${notificationType}`);
    console.log('Params:', params);
    return;
  }

  try {
    // Format the phone number (add country code if missing)
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+91' + formattedNumber.replace(/[^0-9]/g, '');
    }

    // In a real app, you would:
    // 1. Call the WhatsApp Business API to send message
    // 2. Use the correct template based on notificationType
    // 3. Pass the parameters
    
    // Simulate API call
    const response = await simulateWhatsAppApiCall(formattedNumber, notificationType, params);
    return response;
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
    throw error;
  }
}

// Simulate WhatsApp API call (for development)
async function simulateWhatsAppApiCall(
  phoneNumber: string,
  notificationType: NotificationType,
  params: NotificationParams
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Format the notification message based on type
  let message = '';
  
  switch (notificationType) {
    case 'points_earned':
      message = `Hello ${params.customer_name}! You've earned ${params.points} points at ${params.cafe_name}. Your new total is ${params.total_points} points.`;
      break;
    case 'reward_earned':
      message = `Congratulations ${params.customer_name}! You've unlocked a new reward at ${params.cafe_name}: ${params.reward_name}. Visit us to redeem it!`;
      break;
    case 'order_completed':
      message = `Your order #${params.order_id} at ${params.cafe_name} is ready! You earned ${params.points_earned} points with this order.`;
      break;
    case 'game_reminder':
      message = `Hey ${params.customer_name}! Don't forget to play today's games at ${params.cafe_name} for a chance to win exciting rewards!`;
      break;
  }
  
  console.log(`[WHATSAPP SIMULATED DELIVERY TO ${phoneNumber}]`);
  console.log(message);
  
  return {
    success: true,
    message_id: 'wamid.' + Math.random().toString(36).substring(2, 15),
  };
}
