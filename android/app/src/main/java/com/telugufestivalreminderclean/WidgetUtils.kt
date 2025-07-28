package com.telugufestivalreminderclean

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object WidgetUtils {
    fun readFestivalData(context: Context): List<FestivalDay> {
        val json = context.assets.open("festivals2025.json").bufferedReader().use { it.readText() }
        val type = object : TypeToken<List<FestivalDay>>() {}.type
        return Gson().fromJson(json, type)
    }

    private fun getTodayAndNextTwoDates(): List<String> {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val today = LocalDate.now()
        return (0..2).map { today.plusDays(it.toLong()).format(formatter) }
    }

    private fun extractIsoDate(fullDate: String): String? {
        return Regex("""\((\d{4}-\d{2}-\d{2})\)""").find(fullDate)?.groupValues?.get(1)
    }

    fun getUpcomingFestivals(context: Context): String {
        val allDays = readFestivalData(context)
        val wantedDates = getTodayAndNextTwoDates().drop(1)

        val nextFestivals = allDays.filter { day ->
            val isoDate = extractIsoDate(day.date)
            isoDate != null && wantedDates.contains(isoDate)
        }.flatMap { it.festivals }.distinct()

        return if (nextFestivals.isNotEmpty()) {
            "రాబోయే పండుగలు:\n" + nextFestivals.joinToString(", ")
        } else {
            "ఈ రెండు రోజుల్లో పండుగలు లేవు"
        }
    }
}