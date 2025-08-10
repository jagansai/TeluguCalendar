package com.telugufestivalreminderclean

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object WidgetUtils {
    data class WidgetInfo(
        val date: String,
        val thidi: String,
        val year: String,
        val todayFestivals: List<String>,
        val nextLines: List<String>
    )
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

        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val today = LocalDate.now()
        val todayIso = today.format(formatter)
        val next1Iso = today.plusDays(1).format(formatter)
        val next2Iso = today.plusDays(2).format(formatter)

        fun findDayByIso(iso: String): FestivalDay? =
            allDays.firstOrNull { extractIsoDate(it.date) == iso }

    val lines = mutableListOf<String>()

        // Today
        val todayDay = findDayByIso(todayIso)
        val todayFestivals = todayDay?.festivals?.filter { it.isNotBlank() } ?: emptyList()
        if (todayDay != null) {
            val thidi = todayDay.Thidi
            val year = todayDay.year
            lines += "ఈ రోజు: ${todayDay.date}"
            lines += "తిది: ${thidi}"
            lines += "సం: ${year}"
            if (todayFestivals.isNotEmpty()) {
                lines += "పండుగలు: " + todayFestivals.joinToString(", ")
            }
        }

        // Next two days (only include days that actually have festivals)
        listOf(next1Iso, next2Iso).forEach { iso ->
            val d = findDayByIso(iso)
            if (d != null) {
                val fests = d.festivals.filter { it.isNotBlank() }
                if (fests.isNotEmpty()) {
                    // Show as: date: first festival
                    lines += "${d.date}: ${fests.first()}"
                }
            }
        }

        return if (lines.isNotEmpty()) lines.joinToString("\n")
        else "ఈ రోజు మరియు వచ్చే రెండు రోజుల్లో పండుగలు లేవు"
    }

    fun getWidgetInfo(context: Context): WidgetInfo {
        val allDays = readFestivalData(context)

        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val today = LocalDate.now()
        val todayIso = today.format(formatter)
        val next1Iso = today.plusDays(1).format(formatter)
        val next2Iso = today.plusDays(2).format(formatter)

        fun findDayByIso(iso: String): FestivalDay? =
            allDays.firstOrNull { extractIsoDate(it.date) == iso }

        val todayDay = findDayByIso(todayIso)
        val dateStr = todayDay?.date ?: todayIso
        val thidi = todayDay?.Thidi ?: ""
        val year = todayDay?.year ?: ""
        val todayFestivals = todayDay?.festivals?.filter { it.isNotBlank() } ?: emptyList()

        val nextLines = mutableListOf<String>()
        listOf(next1Iso, next2Iso).forEach { iso ->
            val d = findDayByIso(iso)
            if (d != null) {
                val fests = d.festivals.filter { it.isNotBlank() }
                if (fests.isNotEmpty()) {
                    nextLines += "${d.date}: ${fests.first()}"
                }
            }
        }

        return WidgetInfo(
            date = dateStr,
            thidi = thidi,
            year = year,
            todayFestivals = todayFestivals,
            nextLines = nextLines
        )
    }
}