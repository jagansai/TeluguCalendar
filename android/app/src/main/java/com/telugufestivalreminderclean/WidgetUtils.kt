package com.telugufestivalreminderclean

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

object WidgetUtils {
    data class WidgetInfo(
        val date: String,
        val thidi: String,
        val year: String,
        val todayFestivals: List<String>,
        val nextLines: List<String>
    )
    fun readFestivalData(context: Context): List<FestivalDay> {
        val json = try {
            context.assets.open("festivals.json").bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            throw IllegalStateException("festivals.json not found in assets. Run scripts/build-android.ps1 -FestivalsToken te_festivals before building.", e)
        }
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
            val iso = extractIsoDate(todayDay.date) ?: todayIso
            lines += "ఈ రోజు: ${formatTeluguDateFromIso(iso)}"
            lines += "సం: ${year}"
            lines += "తిథి: ${thidi}"
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
                    // Show as: formatted date: first festival
                    val iso = extractIsoDate(d.date) ?: iso
                    lines += "${formatTeluguDateFromIso(iso)}: ${fests.first()}"
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
        val dateStr = if (todayDay != null) formatTeluguDateFromIso(extractIsoDate(todayDay.date) ?: todayIso) else formatTeluguDateFromIso(todayIso)
        val thidi = todayDay?.Thidi ?: ""
        val year = todayDay?.year ?: ""
        val todayFestivals = todayDay?.festivals?.filter { it.isNotBlank() } ?: emptyList()

        val nextLines = mutableListOf<String>()
        listOf(next1Iso, next2Iso).forEach { iso ->
            val d = findDayByIso(iso)
            if (d != null) {
                val fests = d.festivals.filter { it.isNotBlank() }
                if (fests.isNotEmpty()) {
                    val entryIso = extractIsoDate(d.date) ?: iso
                    nextLines += "${formatTeluguDateFromIso(entryIso)}: ${fests.first()}"
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

        private fun formatTeluguDateFromIso(iso: String): String {
            try {
                val parts = iso.split('-')
                val y = parts[0].toInt()
                val m = parts[1].toInt()
                val d = parts[2].toInt()
                val months = listOf(
                    "జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్",
                    "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"
                )
                val monthName = months.getOrNull(m - 1) ?: ""
                val cal = java.time.LocalDate.of(y, m, d)
                val wk = cal.dayOfWeek.value % 7 // java: 1=Mon..7=Sun -> convert to 0=Sun
                val weekdays = listOf("ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని")
                val shortWeek = weekdays.getOrNull(wk) ?: ""
                return "$d $monthName, $y ($shortWeek)"
            } catch (e: Exception) {
                return iso
            }
        }
}