package com.telugufestivalreminderclean.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.telugufestivalreminderclean.FestivalWidgetProvider

class WidgetPinModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "WidgetPin"

    @ReactMethod
    fun isPinSupported(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                promise.resolve(false)
                return
            }
            val mgr = AppWidgetManager.getInstance(reactContext)
            promise.resolve(mgr.isRequestPinAppWidgetSupported)
        } catch (e: Exception) {
            promise.reject("E_PIN_SUPPORTED", e)
        }
    }

    @ReactMethod
    fun requestPin(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                promise.resolve(false)
                return
            }
            val mgr = AppWidgetManager.getInstance(reactContext)
            if (!mgr.isRequestPinAppWidgetSupported) {
                promise.resolve(false)
                return
            }
            val provider = ComponentName(reactContext, FestivalWidgetProvider::class.java)
            val ok = mgr.requestPinAppWidget(provider, null, null)
            promise.resolve(ok)
        } catch (e: Exception) {
            promise.reject("E_PIN_REQUEST", e)
        }
    }
}
