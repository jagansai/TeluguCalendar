package com.telugufestivalreminderclean

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class FestivalWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, widgetIds: IntArray) {
        val text = WidgetUtils.getUpcomingFestivals(context)

        for (widgetId in widgetIds) {
            val views = RemoteViews(context.packageName, R.layout.festival_widget)
            views.setTextViewText(R.id.widgetText, text)
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}