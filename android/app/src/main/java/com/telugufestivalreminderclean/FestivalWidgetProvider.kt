package com.telugufestivalreminderclean

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.util.Calendar

class FestivalWidgetProvider : AppWidgetProvider() {

    private fun renderWidgets(context: Context, appWidgetManager: AppWidgetManager, widgetIds: IntArray) {
        val info = WidgetUtils.getWidgetInfo(context)
        for (widgetId in widgetIds) {
            val views = RemoteViews(context.packageName, R.layout.festival_widget)
            // Date
            views.setTextViewText(R.id.tvDate, "ఈ రోజు: ${info.date}")
            // Thidi
            views.setTextViewText(R.id.tvThidi, "తిథి: ${info.thidi}")
            // Year
            views.setTextViewText(R.id.tvYear, "సం: ${info.year}")
            // Festivals today
            if (info.todayFestivals.isNotEmpty()) {
                views.setViewVisibility(R.id.tvFestivals, android.view.View.VISIBLE)
                views.setTextViewText(R.id.tvFestivals, "పండుగలు: " + info.todayFestivals.joinToString(", "))
            } else {
                views.setViewVisibility(R.id.tvFestivals, android.view.View.GONE)
            }
            // Next days
            if (info.nextLines.isNotEmpty()) {
                views.setViewVisibility(R.id.tvNext, android.view.View.VISIBLE)
                views.setTextViewText(R.id.tvNext, info.nextLines.joinToString("\n"))
            } else {
                views.setViewVisibility(R.id.tvNext, android.view.View.GONE)
            }
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, widgetIds: IntArray) {
        renderWidgets(context, appWidgetManager, widgetIds)
    scheduleDailyUpdate(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            Intent.ACTION_DATE_CHANGED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_BOOT_COMPLETED,
            AppWidgetManager.ACTION_APPWIDGET_UPDATE -> {
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val thisWidget = ComponentName(context, FestivalWidgetProvider::class.java)
                val ids = appWidgetManager.getAppWidgetIds(thisWidget)
                if (ids != null && ids.isNotEmpty()) {
                    renderWidgets(context, appWidgetManager, ids)
                }
                scheduleDailyUpdate(context)
            }
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        scheduleDailyUpdate(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        cancelDailyUpdate(context)
    }

    private fun scheduleDailyUpdate(context: Context) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, FestivalWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pi = PendingIntent.getBroadcast(context, 0, intent, flags)

        val cal = Calendar.getInstance().apply {
            timeInMillis = System.currentTimeMillis()
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 5) // a few minutes after midnight
        }
        // Inexact repeating avoids exact alarm permission on Android 12+
        am.setInexactRepeating(AlarmManager.RTC, cal.timeInMillis, AlarmManager.INTERVAL_DAY, pi)
    }

    private fun cancelDailyUpdate(context: Context) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, FestivalWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pi = PendingIntent.getBroadcast(context, 0, intent, flags)
        am.cancel(pi)
    }
}