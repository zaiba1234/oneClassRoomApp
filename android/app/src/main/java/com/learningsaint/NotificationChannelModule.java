package com.learningsaint;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class NotificationChannelModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public NotificationChannelModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationChannelService";
    }

    @ReactMethod
    public void createNotificationChannel(ReadableMap channelConfig, Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                String id = channelConfig.getString("id");
                String name = channelConfig.getString("name");
                String description = channelConfig.getString("description");
                String importance = channelConfig.getString("importance");
                boolean sound = channelConfig.getBoolean("sound");
                boolean vibration = channelConfig.getBoolean("vibration");
                boolean lights = channelConfig.getBoolean("lights");
                String lightColor = channelConfig.getString("lightColor");

                NotificationManager notificationManager = 
                    (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);

                if (notificationManager != null) {
                    NotificationChannel channel = new NotificationChannel(id, name, getImportanceLevel(importance));
                    channel.setDescription(description);
                    channel.enableLights(lights);
                    channel.enableVibration(vibration);
                    
                    if (lightColor != null && !lightColor.isEmpty()) {
                        try {
                            int color = android.graphics.Color.parseColor(lightColor);
                            channel.setLightColor(color);
                        } catch (Exception e) {
                            // Use default color if parsing fails
                            channel.setLightColor(android.graphics.Color.WHITE);
                        }
                    }

                    if (!sound) {
                        channel.setSound(null, null);
                    }

                    notificationManager.createNotificationChannel(channel);
                    promise.resolve(true);
                } else {
                    promise.reject("ERROR", "NotificationManager not available");
                }
            } else {
                // For Android versions below 8.0, channels are not needed
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to create notification channel: " + e.getMessage());
        }
    }

    private int getImportanceLevel(String importance) {
        switch (importance.toLowerCase()) {
            case "high":
                return NotificationManager.IMPORTANCE_HIGH;
            case "default":
                return NotificationManager.IMPORTANCE_DEFAULT;
            case "low":
                return NotificationManager.IMPORTANCE_LOW;
            case "min":
                return NotificationManager.IMPORTANCE_MIN;
            default:
                return NotificationManager.IMPORTANCE_DEFAULT;
        }
    }
}
