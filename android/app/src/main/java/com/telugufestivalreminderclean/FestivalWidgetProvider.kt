package com.telugufestivalreminderclean

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class FestivalWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, widgetIds: IntArray) {
    val info = WidgetUtils.getWidgetInfo(context)

        for (widgetId in widgetIds) {
            val views = RemoteViews(context.packageName, R.layout.festival_widget)
            // Date
            views.setTextViewText(R.id.tvDate, "ఈ రోజు: ${info.date}")
            // Thidi
            views.setTextViewText(R.id.tvThidi, "తిది: ${info.thidi}")
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
}