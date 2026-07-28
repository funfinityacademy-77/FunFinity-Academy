import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer, Search, Check, Sparkles, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  weather: WeatherData;
  flag: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: "sun" | "cloud" | "rain" | "snow" | "wind";
}

const weatherIcons: Record<string, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: Snowflake,
  wind: Wind,
};

const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", weather: { temp: 22, condition: "Sunny", humidity: 45, windSpeed: 12, icon: "sun" } },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", weather: { temp: 15, condition: "Cloudy", humidity: 70, windSpeed: 18, icon: "cloud" } },
  { code: "JP", name: "Japan", flag: "🇯🇵", weather: { temp: 20, condition: "Partly Cloudy", humidity: 60, windSpeed: 8, icon: "cloud" } },
  { code: "FR", name: "France", flag: "🇫🇷", weather: { temp: 18, condition: "Sunny", humidity: 55, windSpeed: 10, icon: "sun" } },
  { code: "DE", name: "Germany", flag: "🇩🇪", weather: { temp: 16, condition: "Cloudy", humidity: 65, windSpeed: 15, icon: "cloud" } },
  { code: "CA", name: "Canada", flag: "🇨🇦", weather: { temp: 12, condition: "Snow", humidity: 75, windSpeed: 20, icon: "snow" } },
  { code: "AU", name: "Australia", flag: "🇦🇺", weather: { temp: 28, condition: "Sunny", humidity: 40, windSpeed: 14, icon: "sun" } },
  { code: "BR", name: "Brazil", flag: "🇧🇷", weather: { temp: 30, condition: "Sunny", humidity: 70, windSpeed: 8, icon: "sun" } },
  { code: "IN", name: "India", flag: "🇮🇳", weather: { temp: 32, condition: "Sunny", humidity: 60, windSpeed: 12, icon: "sun" } },
  { code: "CN", name: "China", flag: "🇨🇳", weather: { temp: 24, condition: "Cloudy", humidity: 55, windSpeed: 10, icon: "cloud" } },
  { code: "IT", name: "Italy", flag: "🇮🇹", weather: { temp: 22, condition: "Sunny", humidity: 50, windSpeed: 11, icon: "sun" } },
  { code: "ES", name: "Spain", flag: "🇪🇸", weather: { temp: 26, condition: "Sunny", humidity: 45, windSpeed: 13, icon: "sun" } },
  { code: "MX", name: "Mexico", flag: "🇲🇽", weather: { temp: 28, condition: "Sunny", humidity: 55, windSpeed: 9, icon: "sun" } },
  { code: "KR", name: "South Korea", flag: "🇰🇷", weather: { temp: 19, condition: "Cloudy", humidity: 65, windSpeed: 7, icon: "cloud" } },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", weather: { temp: 17, condition: "Rainy", humidity: 80, windSpeed: 16, icon: "rain" } },
  { code: "SE", name: "Sweden", flag: "🇸🇪", weather: { temp: 14, condition: "Cloudy", humidity: 70, windSpeed: 12, icon: "cloud" } },
  { code: "NO", name: "Norway", flag: "🇳🇴", weather: { temp: 13, condition: "Snow", humidity: 75, windSpeed: 18, icon: "snow" } },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", weather: { temp: 16, condition: "Cloudy", humidity: 60, windSpeed: 8, icon: "cloud" } },
  { code: "AT", name: "Austria", flag: "🇦🇹", weather: { temp: 15, condition: "Cloudy", humidity: 65, windSpeed: 10, icon: "cloud" } },
  { code: "BE", name: "Belgium", flag: "🇧🇪", weather: { temp: 16, condition: "Rainy", humidity: 78, windSpeed: 14, icon: "rain" } },
  { code: "DK", name: "Denmark", flag: "🇩🇰", weather: { temp: 15, condition: "Cloudy", humidity: 72, windSpeed: 17, icon: "cloud" } },
  { code: "RU", name: "Russia", flag: "🇷🇺", weather: { temp: 8, condition: "Snow", humidity: 80, windSpeed: 15, icon: "snow" } },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", weather: { temp: 25, condition: "Sunny", humidity: 50, windSpeed: 11, icon: "sun" } },
  { code: "AR", name: "Argentina", flag: "🇦🇷", weather: { temp: 23, condition: "Sunny", humidity: 55, windSpeed: 10, icon: "sun" } },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", weather: { temp: 35, condition: "Sunny", humidity: 30, windSpeed: 8, icon: "sun" } },
  { code: "TR", name: "Turkey", flag: "🇹🇷", weather: { temp: 24, condition: "Sunny", humidity: 45, windSpeed: 12, icon: "sun" } },
  { code: "TH", name: "Thailand", flag: "🇹🇭", weather: { temp: 31, condition: "Sunny", humidity: 75, windSpeed: 6, icon: "sun" } },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", weather: { temp: 30, condition: "Rainy", humidity: 85, windSpeed: 7, icon: "rain" } },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", weather: { temp: 32, condition: "Rainy", humidity: 80, windSpeed: 5, icon: "rain" } },
  { code: "SG", name: "Singapore", flag: "🇸🇬", weather: { temp: 31, condition: "Rainy", humidity: 82, windSpeed: 6, icon: "rain" } },
  { code: "PH", name: "Philippines", flag: "🇵🇭", weather: { temp: 30, condition: "Sunny", humidity: 78, windSpeed: 9, icon: "sun" } },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", weather: { temp: 29, condition: "Cloudy", humidity: 75, windSpeed: 8, icon: "cloud" } },
  { code: "EG", name: "Egypt", flag: "🇪🇬", weather: { temp: 33, condition: "Sunny", humidity: 35, windSpeed: 14, icon: "sun" } },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", weather: { temp: 31, condition: "Sunny", humidity: 65, windSpeed: 10, icon: "sun" } },
  { code: "KE", name: "Kenya", flag: "🇰🇪", weather: { temp: 26, condition: "Sunny", humidity: 55, windSpeed: 11, icon: "sun" } },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", weather: { temp: 25, condition: "Sunny", humidity: 50, windSpeed: 11, icon: "sun" } },
  { code: "MA", name: "Morocco", flag: "🇲🇦", weather: { temp: 28, condition: "Sunny", humidity: 40, windSpeed: 15, icon: "sun" } },
  { code: "GR", name: "Greece", flag: "🇬🇷", weather: { temp: 25, condition: "Sunny", humidity: 50, windSpeed: 12, icon: "sun" } },
  { code: "PT", name: "Portugal", flag: "🇵🇹", weather: { temp: 24, condition: "Sunny", humidity: 55, windSpeed: 13, icon: "sun" } },
  { code: "IE", name: "Ireland", flag: "🇮🇪", weather: { temp: 16, condition: "Rainy", humidity: 82, windSpeed: 20, icon: "rain" } },
  { code: "PL", name: "Poland", flag: "🇵🇱", weather: { temp: 14, condition: "Cloudy", humidity: 68, windSpeed: 14, icon: "cloud" } },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", weather: { temp: 15, condition: "Cloudy", humidity: 65, windSpeed: 11, icon: "cloud" } },
  { code: "HU", name: "Hungary", flag: "🇭🇺", weather: { temp: 17, condition: "Cloudy", humidity: 60, windSpeed: 9, icon: "cloud" } },
  { code: "RO", name: "Romania", flag: "🇷🇴", weather: { temp: 18, condition: "Cloudy", humidity: 62, windSpeed: 10, icon: "cloud" } },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", weather: { temp: 13, condition: "Cloudy", humidity: 70, windSpeed: 16, icon: "cloud" } },
  { code: "FI", name: "Finland", flag: "🇫🇮", weather: { temp: 10, condition: "Snow", humidity: 78, windSpeed: 14, icon: "snow" } },
  { code: "IS", name: "Iceland", flag: "🇮🇸", weather: { temp: 7, condition: "Snow", humidity: 82, windSpeed: 22, icon: "snow" } },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", weather: { temp: 18, condition: "Cloudy", humidity: 72, windSpeed: 15, icon: "cloud" } },
  { code: "CL", name: "Chile", flag: "🇨🇱", weather: { temp: 20, condition: "Sunny", humidity: 48, windSpeed: 12, icon: "sun" } },
  { code: "PE", name: "Peru", flag: "🇵🇪", weather: { temp: 24, condition: "Sunny", humidity: 52, windSpeed: 9, icon: "sun" } },
  { code: "CO", name: "Colombia", flag: "🇨🇴", weather: { temp: 26, condition: "Rainy", humidity: 78, windSpeed: 7, icon: "rain" } },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", weather: { temp: 29, condition: "Sunny", humidity: 68, windSpeed: 8, icon: "sun" } },
  { code: "CU", name: "Cuba", flag: "🇨🇺", weather: { temp: 28, condition: "Sunny", humidity: 65, windSpeed: 11, icon: "sun" } },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", weather: { temp: 30, condition: "Sunny", humidity: 72, windSpeed: 10, icon: "sun" } },
  { code: "HT", name: "Haiti", flag: "🇭🇹", weather: { temp: 29, condition: "Sunny", humidity: 75, windSpeed: 12, icon: "sun" } },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", weather: { temp: 30, condition: "Sunny", humidity: 70, windSpeed: 11, icon: "sun" } },
  { code: "PA", name: "Panama", flag: "🇵🇦", weather: { temp: 31, condition: "Rainy", humidity: 80, windSpeed: 6, icon: "rain" } },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", weather: { temp: 27, condition: "Rainy", humidity: 85, windSpeed: 7, icon: "rain" } },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", weather: { temp: 26, condition: "Sunny", humidity: 60, windSpeed: 9, icon: "sun" } },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", weather: { temp: 28, condition: "Sunny", humidity: 65, windSpeed: 10, icon: "sun" } },
  { code: "HN", name: "Honduras", flag: "🇭🇳", weather: { temp: 27, condition: "Rainy", humidity: 78, windSpeed: 8, icon: "rain" } },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", weather: { temp: 28, condition: "Sunny", humidity: 70, windSpeed: 9, icon: "sun" } },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", weather: { temp: 22, condition: "Cloudy", humidity: 55, windSpeed: 11, icon: "cloud" } },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", weather: { temp: 27, condition: "Sunny", humidity: 60, windSpeed: 8, icon: "sun" } },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", weather: { temp: 20, condition: "Cloudy", humidity: 68, windSpeed: 14, icon: "cloud" } },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", weather: { temp: 24, condition: "Rainy", humidity: 75, windSpeed: 8, icon: "rain" } },
  { code: "GY", name: "Guyana", flag: "🇬🇾", weather: { temp: 29, condition: "Sunny", humidity: 72, windSpeed: 7, icon: "sun" } },
  { code: "SR", name: "Suriname", flag: "🇸🇷", weather: { temp: 28, condition: "Rainy", humidity: 80, windSpeed: 6, icon: "rain" } },
  { code: "GF", name: "French Guiana", flag: "🇬🇫", weather: { temp: 27, condition: "Rainy", humidity: 85, windSpeed: 5, icon: "rain" } },
  { code: "IL", name: "Israel", flag: "🇮🇱", weather: { temp: 28, condition: "Sunny", humidity: 40, windSpeed: 15, icon: "sun" } },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", weather: { temp: 36, condition: "Sunny", humidity: 35, windSpeed: 10, icon: "sun" } },
  { code: "QA", name: "Qatar", flag: "🇶🇦", weather: { temp: 35, condition: "Sunny", humidity: 38, windSpeed: 12, icon: "sun" } },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", weather: { temp: 38, condition: "Sunny", humidity: 30, windSpeed: 13, icon: "sun" } },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", weather: { temp: 34, condition: "Sunny", humidity: 45, windSpeed: 11, icon: "sun" } },
  { code: "OM", name: "Oman", flag: "🇴🇲", weather: { temp: 33, condition: "Sunny", humidity: 42, windSpeed: 10, icon: "sun" } },
  { code: "YE", name: "Yemen", flag: "🇾🇪", weather: { temp: 32, condition: "Sunny", humidity: 40, windSpeed: 14, icon: "sun" } },
  { code: "JO", name: "Jordan", flag: "🇯🇴", weather: { temp: 29, condition: "Sunny", humidity: 35, windSpeed: 12, icon: "sun" } },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", weather: { temp: 26, condition: "Sunny", humidity: 50, windSpeed: 11, icon: "sun" } },
  { code: "SY", name: "Syria", flag: "🇸🇾", weather: { temp: 30, condition: "Sunny", humidity: 38, windSpeed: 13, icon: "sun" } },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", weather: { temp: 34, condition: "Sunny", humidity: 32, windSpeed: 14, icon: "sun" } },
  { code: "IR", name: "Iran", flag: "🇮🇷", weather: { temp: 32, condition: "Sunny", humidity: 35, windSpeed: 12, icon: "sun" } },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", weather: { temp: 25, condition: "Sunny", humidity: 30, windSpeed: 15, icon: "sun" } },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", weather: { temp: 33, condition: "Sunny", humidity: 45, windSpeed: 11, icon: "sun" } },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", weather: { temp: 31, condition: "Rainy", humidity: 82, windSpeed: 7, icon: "rain" } },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", weather: { temp: 30, condition: "Rainy", humidity: 80, windSpeed: 8, icon: "rain" } },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", weather: { temp: 29, condition: "Cloudy", humidity: 75, windSpeed: 6, icon: "cloud" } },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", weather: { temp: 32, condition: "Sunny", humidity: 72, windSpeed: 6, icon: "sun" } },
  { code: "LA", name: "Laos", flag: "🇱🇦", weather: { temp: 30, condition: "Cloudy", humidity: 78, windSpeed: 5, icon: "cloud" } },
  { code: "NP", name: "Nepal", flag: "🇳🇵", weather: { temp: 24, condition: "Cloudy", humidity: 60, windSpeed: 9, icon: "cloud" } },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", weather: { temp: 18, condition: "Cloudy", humidity: 65, windSpeed: 8, icon: "cloud" } },
  { code: "MV", name: "Maldives", flag: "🇲🇻", weather: { temp: 30, condition: "Sunny", humidity: 78, windSpeed: 12, icon: "sun" } },
  { code: "MV", name: "Maldives", flag: "🇲🇻", weather: { temp: 30, condition: "Sunny", humidity: 78, windSpeed: 12, icon: "sun" } },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", weather: { temp: 18, condition: "Cloudy", humidity: 50, windSpeed: 16, icon: "cloud" } },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", weather: { temp: 25, condition: "Sunny", humidity: 35, windSpeed: 12, icon: "sun" } },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", weather: { temp: 28, condition: "Sunny", humidity: 32, windSpeed: 14, icon: "sun" } },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", weather: { temp: 20, condition: "Cloudy", humidity: 45, windSpeed: 10, icon: "cloud" } },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", weather: { temp: 22, condition: "Sunny", humidity: 40, windSpeed: 9, icon: "sun" } },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", weather: { temp: 15, condition: "Cloudy", humidity: 45, windSpeed: 18, icon: "cloud" } },
  { code: "AL", name: "Albania", flag: "🇦🇱", weather: { temp: 22, condition: "Sunny", humidity: 55, windSpeed: 10, icon: "sun" } },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", weather: { temp: 21, condition: "Cloudy", humidity: 58, windSpeed: 9, icon: "cloud" } },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", weather: { temp: 23, condition: "Sunny", humidity: 52, windSpeed: 11, icon: "sun" } },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", weather: { temp: 20, condition: "Cloudy", humidity: 60, windSpeed: 8, icon: "cloud" } },
  { code: "HR", name: "Croatia", flag: "🇭🇷", weather: { temp: 24, condition: "Sunny", humidity: 50, windSpeed: 12, icon: "sun" } },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", weather: { temp: 19, condition: "Cloudy", humidity: 62, windSpeed: 9, icon: "cloud" } },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", weather: { temp: 17, condition: "Cloudy", humidity: 64, windSpeed: 11, icon: "cloud" } },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", weather: { temp: 21, condition: "Sunny", humidity: 55, windSpeed: 10, icon: "sun" } },
  { code: "RS", name: "Serbia", flag: "🇷🇸", weather: { temp: 22, condition: "Cloudy", humidity: 58, windSpeed: 9, icon: "cloud" } },
  { code: "XK", name: "Kosovo", flag: "🇽🇰", weather: { temp: 20, condition: "Cloudy", humidity: 60, windSpeed: 8, icon: "cloud" } },
  { code: "MT", name: "Malta", flag: "🇲🇹", weather: { temp: 26, condition: "Sunny", humidity: 48, windSpeed: 14, icon: "sun" } },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", weather: { temp: 28, condition: "Sunny", humidity: 42, windSpeed: 11, icon: "sun" } },
  { code: "GE", name: "Georgia", flag: "🇬🇪", weather: { temp: 23, condition: "Sunny", humidity: 48, windSpeed: 10, icon: "sun" } },
  { code: "AM", name: "Armenia", flag: "🇦🇲", weather: { temp: 22, condition: "Sunny", humidity: 45, windSpeed: 9, icon: "sun" } },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", weather: { temp: 25, condition: "Sunny", humidity: 40, windSpeed: 12, icon: "sun" } },
  { code: "BY", name: "Belarus", flag: "🇧🇾", weather: { temp: 14, condition: "Cloudy", humidity: 72, windSpeed: 13, icon: "cloud" } },
  { code: "LV", name: "Latvia", flag: "🇱🇻", weather: { temp: 15, condition: "Cloudy", humidity: 70, windSpeed: 14, icon: "cloud" } },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", weather: { temp: 16, condition: "Cloudy", humidity: 68, windSpeed: 13, icon: "cloud" } },
  { code: "EE", name: "Estonia", flag: "🇪🇪", weather: { temp: 14, condition: "Cloudy", humidity: 72, windSpeed: 15, icon: "cloud" } },
  { code: "MD", name: "Moldova", flag: "🇲🇩", weather: { temp: 19, condition: "Cloudy", humidity: 65, windSpeed: 10, icon: "cloud" } },
  { code: "AD", name: "Andorra", flag: "🇦🇩", weather: { temp: 18, condition: "Cloudy", humidity: 60, windSpeed: 12, icon: "cloud" } },
  { code: "MC", name: "Monaco", flag: "🇲🇨", weather: { temp: 22, condition: "Sunny", humidity: 52, windSpeed: 11, icon: "sun" } },
  { code: "SM", name: "San Marino", flag: "🇸🇲", weather: { temp: 21, condition: "Sunny", humidity: 50, windSpeed: 10, icon: "sun" } },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", weather: { temp: 22, condition: "Sunny", humidity: 48, windSpeed: 9, icon: "sun" } },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", weather: { temp: 17, condition: "Cloudy", humidity: 58, windSpeed: 8, icon: "cloud" } },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", weather: { temp: 17, condition: "Cloudy", humidity: 68, windSpeed: 12, icon: "cloud" } },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", weather: { temp: 30, condition: "Sunny", humidity: 35, windSpeed: 15, icon: "sun" } },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", weather: { temp: 29, condition: "Sunny", humidity: 45, windSpeed: 14, icon: "sun" } },
  { code: "LY", name: "Libya", flag: "🇱🇾", weather: { temp: 32, condition: "Sunny", humidity: 30, windSpeed: 18, icon: "sun" } },
  { code: "SD", name: "Sudan", flag: "🇸🇩", weather: { temp: 35, condition: "Sunny", humidity: 25, windSpeed: 16, icon: "sun" } },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", weather: { temp: 27, condition: "Sunny", humidity: 45, windSpeed: 12, icon: "sun" } },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", weather: { temp: 28, condition: "Sunny", humidity: 55, windSpeed: 10, icon: "sun" } },
  { code: "UG", name: "Uganda", flag: "🇺🇬", weather: { temp: 26, condition: "Rainy", humidity: 70, windSpeed: 8, icon: "rain" } },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", weather: { temp: 24, condition: "Cloudy", humidity: 68, windSpeed: 9, icon: "cloud" } },
  { code: "BI", name: "Burundi", flag: "🇧🇮", weather: { temp: 23, condition: "Rainy", humidity: 75, windSpeed: 7, icon: "rain" } },
  { code: "CD", name: "Democratic Republic of the Congo", flag: "🇨🇩", weather: { temp: 27, condition: "Rainy", humidity: 80, windSpeed: 6, icon: "rain" } },
  { code: "CG", name: "Republic of the Congo", flag: "🇨🇬", weather: { temp: 28, condition: "Rainy", humidity: 82, windSpeed: 5, icon: "rain" } },
  { code: "GA", name: "Gabon", flag: "🇬🇦", weather: { temp: 27, condition: "Cloudy", humidity: 78, windSpeed: 8, icon: "cloud" } },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", weather: { temp: 28, condition: "Cloudy", humidity: 72, windSpeed: 9, icon: "cloud" } },
  { code: "AO", name: "Angola", flag: "🇦🇴", weather: { temp: 26, condition: "Sunny", humidity: 60, windSpeed: 11, icon: "sun" } },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", weather: { temp: 27, condition: "Sunny", humidity: 65, windSpeed: 12, icon: "sun" } },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", weather: { temp: 26, condition: "Sunny", humidity: 55, windSpeed: 10, icon: "sun" } },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", weather: { temp: 25, condition: "Sunny", humidity: 50, windSpeed: 11, icon: "sun" } },
  { code: "BW", name: "Botswana", flag: "🇧🇼", weather: { temp: 28, condition: "Sunny", humidity: 35, windSpeed: 13, icon: "sun" } },
  { code: "NA", name: "Namibia", flag: "🇳🇦", weather: { temp: 26, condition: "Sunny", humidity: 30, windSpeed: 15, icon: "sun" } },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", weather: { temp: 26, condition: "Rainy", humidity: 75, windSpeed: 14, icon: "rain" } },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", weather: { temp: 27, condition: "Sunny", humidity: 68, windSpeed: 16, icon: "sun" } },
  { code: "RE", name: "Réunion", flag: "🇷🇪", weather: { temp: 26, condition: "Sunny", humidity: 65, windSpeed: 15, icon: "sun" } },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", weather: { temp: 29, condition: "Sunny", humidity: 70, windSpeed: 12, icon: "sun" } },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", weather: { temp: 32, condition: "Sunny", humidity: 28, windSpeed: 18, icon: "sun" } },
  { code: "ML", name: "Mali", flag: "🇲🇱", weather: { temp: 33, condition: "Sunny", humidity: 30, windSpeed: 14, icon: "sun" } },
  { code: "NE", name: "Niger", flag: "🇳🇪", weather: { temp: 34, condition: "Sunny", humidity: 25, windSpeed: 16, icon: "sun" } },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", weather: { temp: 33, condition: "Sunny", humidity: 35, windSpeed: 12, icon: "sun" } },
  { code: "CI", name: "Ivory Coast", flag: "🇨🇮", weather: { temp: 30, condition: "Cloudy", humidity: 72, windSpeed: 10, icon: "cloud" } },
  { code: "GH", name: "Ghana", flag: "🇬🇭", weather: { temp: 30, condition: "Sunny", humidity: 68, windSpeed: 11, icon: "sun" } },
  { code: "SN", name: "Senegal", flag: "🇸🇳", weather: { temp: 30, condition: "Sunny", humidity: 55, windSpeed: 14, icon: "sun" } },
  { code: "GM", name: "Gambia", flag: "🇬🇲", weather: { temp: 31, condition: "Sunny", humidity: 60, windSpeed: 12, icon: "sun" } },
  { code: "GN", name: "Guinea", flag: "🇬🇳", weather: { temp: 29, condition: "Rainy", humidity: 78, windSpeed: 8, icon: "rain" } },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", weather: { temp: 29, condition: "Rainy", humidity: 80, windSpeed: 9, icon: "rain" } },
  { code: "LR", name: "Liberia", flag: "🇱🇷", weather: { temp: 28, condition: "Rainy", humidity: 82, windSpeed: 7, icon: "rain" } },
  { code: "TG", name: "Togo", flag: "🇹🇬", weather: { temp: 30, condition: "Sunny", humidity: 65, windSpeed: 11, icon: "sun" } },
  { code: "BJ", name: "Benin", flag: "🇧🇯", weather: { temp: 30, condition: "Sunny", humidity: 68, windSpeed: 10, icon: "sun" } },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", weather: { temp: 28, condition: "Cloudy", humidity: 70, windSpeed: 8, icon: "cloud" } },
  { code: "TD", name: "Chad", flag: "🇹🇩", weather: { temp: 32, condition: "Sunny", humidity: 35, windSpeed: 14, icon: "sun" } },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", weather: { temp: 30, condition: "Sunny", humidity: 45, windSpeed: 16, icon: "sun" } },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", weather: { temp: 32, condition: "Sunny", humidity: 50, windSpeed: 18, icon: "sun" } },
  { code: "SO", name: "Somalia", flag: "🇸🇴", weather: { temp: 33, condition: "Sunny", humidity: 40, windSpeed: 15, icon: "sun" } },
  { code: "GM", name: "Gambia", flag: "🇬🇲", weather: { temp: 31, condition: "Sunny", humidity: 60, windSpeed: 12, icon: "sun" } },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", weather: { temp: 26, condition: "Sunny", humidity: 55, windSpeed: 17, icon: "sun" } },
  { code: "ST", name: "São Tomé and Príncipe", flag: "🇸🇹", weather: { temp: 27, condition: "Rainy", humidity: 75, windSpeed: 10, icon: "rain" } },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", weather: { temp: 28, condition: "Cloudy", humidity: 80, windSpeed: 6, icon: "cloud" } },
  { code: "BJ", name: "Benin", flag: "🇧🇯", weather: { temp: 30, condition: "Sunny", humidity: 68, windSpeed: 10, icon: "sun" } },
  { code: "NA", name: "Namibia", flag: "🇳🇦", weather: { temp: 26, condition: "Sunny", humidity: 30, windSpeed: 15, icon: "sun" } },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", weather: { temp: 18, condition: "Cloudy", humidity: 55, windSpeed: 13, icon: "cloud" } },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", weather: { temp: 24, condition: "Sunny", humidity: 52, windSpeed: 10, icon: "sun" } },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", weather: { temp: 27, condition: "Sunny", humidity: 70, windSpeed: 14, icon: "sun" } },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", weather: { temp: 28, condition: "Rainy", humidity: 82, windSpeed: 7, icon: "rain" } },
  { code: "SB", name: "Solomon Islands", flag: "🇸🇧", weather: { temp: 28, condition: "Rainy", humidity: 80, windSpeed: 8, icon: "rain" } },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", weather: { temp: 27, condition: "Sunny", humidity: 72, windSpeed: 12, icon: "sun" } },
  { code: "NC", name: "New Caledonia", flag: "🇳🇨", weather: { temp: 25, condition: "Sunny", humidity: 65, windSpeed: 13, icon: "sun" } },
  { code: "PF", name: "French Polynesia", flag: "🇵🇫", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 11, icon: "sun" } },
  { code: "WS", name: "Samoa", flag: "🇼🇸", weather: { temp: 29, condition: "Sunny", humidity: 75, windSpeed: 10, icon: "sun" } },
  { code: "TO", name: "Tonga", flag: "🇹🇴", weather: { temp: 26, condition: "Sunny", humidity: 70, windSpeed: 14, icon: "sun" } },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", weather: { temp: 29, condition: "Sunny", humidity: 72, windSpeed: 11, icon: "sun" } },
  { code: "MV", name: "Maldives", flag: "🇲🇻", weather: { temp: 30, condition: "Sunny", humidity: 78, windSpeed: 12, icon: "sun" } },
  { code: "FM", name: "Micronesia", flag: "🇫🇲", weather: { temp: 28, condition: "Rainy", humidity: 80, windSpeed: 9, icon: "rain" } },
  { code: "MH", name: "Marshall Islands", flag: "🇲🇭", weather: { temp: 28, condition: "Sunny", humidity: 75, windSpeed: 12, icon: "sun" } },
  { code: "PW", name: "Palau", flag: "🇵🇼", weather: { temp: 29, condition: "Sunny", humidity: 72, windSpeed: 10, icon: "sun" } },
  { code: "NR", name: "Nauru", flag: "🇳🇷", weather: { temp: 30, condition: "Sunny", humidity: 70, windSpeed: 13, icon: "sun" } },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", weather: { temp: 29, condition: "Sunny", humidity: 74, windSpeed: 11, icon: "sun" } },
  { code: "CK", name: "Cook Islands", flag: "🇨🇰", weather: { temp: 26, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "NU", name: "Niue", flag: "🇳🇺", weather: { temp: 25, condition: "Cloudy", humidity: 70, windSpeed: 15, icon: "cloud" } },
  { code: "AS", name: "American Samoa", flag: "🇦🇸", weather: { temp: 28, condition: "Rainy", humidity: 78, windSpeed: 12, icon: "rain" } },
  { code: "GU", name: "Guam", flag: "🇬🇺", weather: { temp: 29, condition: "Sunny", humidity: 72, windSpeed: 14, icon: "sun" } },
  { code: "MP", name: "Northern Mariana Islands", flag: "🇲🇵", weather: { temp: 28, condition: "Sunny", humidity: 70, windSpeed: 13, icon: "sun" } },
  { code: "VI", name: "Virgin Islands (US)", flag: "🇻🇮", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 12, icon: "sun" } },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", weather: { temp: 29, condition: "Sunny", humidity: 65, windSpeed: 11, icon: "sun" } },
  { code: "GL", name: "Greenland", flag: "🇬🇱", weather: { temp: 5, condition: "Snow", humidity: 85, windSpeed: 20, icon: "snow" } },
  { code: "FO", name: "Faroe Islands", flag: "🇫🇴", weather: { temp: 10, condition: "Cloudy", humidity: 80, windSpeed: 22, icon: "cloud" } },
  { code: "AX", name: "Åland Islands", flag: "🇦🇽", weather: { temp: 14, condition: "Cloudy", humidity: 72, windSpeed: 15, icon: "cloud" } },
  { code: "SJ", name: "Svalbard and Jan Mayen", flag: "🇸🇯", weather: { temp: -5, condition: "Snow", humidity: 90, windSpeed: 25, icon: "snow" } },
  { code: "BQ", name: "Caribbean Netherlands", flag: "🇧🇶", weather: { temp: 29, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "CW", name: "Curaçao", flag: "🇨🇼", weather: { temp: 30, condition: "Sunny", humidity: 65, windSpeed: 13, icon: "sun" } },
  { code: "SX", name: "Sint Maarten", flag: "🇸🇽", weather: { temp: 29, condition: "Sunny", humidity: 70, windSpeed: 12, icon: "sun" } },
  { code: "FK", name: "Falkland Islands", flag: "🇫🇰", weather: { temp: 10, condition: "Cloudy", humidity: 75, windSpeed: 20, icon: "cloud" } },
  { code: "GS", name: "South Georgia and the South Sandwich Islands", flag: "🇬🇸", weather: { temp: 2, condition: "Snow", humidity: 88, windSpeed: 28, icon: "snow" } },
  { code: "BM", name: "Bermuda", flag: "🇧🇲", weather: { temp: 24, condition: "Sunny", humidity: 68, windSpeed: 18, icon: "sun" } },
  { code: "KY", name: "Cayman Islands", flag: "🇰🇾", weather: { temp: 28, condition: "Sunny", humidity: 70, windSpeed: 12, icon: "sun" } },
  { code: "TC", name: "Turks and Caicos Islands", flag: "🇹🇨", weather: { temp: 27, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "VG", name: "Virgin Islands (British)", flag: "🇻🇬", weather: { temp: 27, condition: "Sunny", humidity: 65, windSpeed: 13, icon: "sun" } },
  { code: "MS", name: "Montserrat", flag: "🇲🇸", weather: { temp: 27, condition: "Sunny", humidity: 70, windSpeed: 15, icon: "sun" } },
  { code: "AI", name: "Anguilla", flag: "🇦🇮", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "BB", name: "Barbados", flag: "🇧🇧", weather: { temp: 28, condition: "Sunny", humidity: 65, windSpeed: 16, icon: "sun" } },
  { code: "DM", name: "Dominica", flag: "🇩🇲", weather: { temp: 27, condition: "Rainy", humidity: 75, windSpeed: 12, icon: "rain" } },
  { code: "GD", name: "Grenada", flag: "🇬🇩", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", weather: { temp: 28, condition: "Sunny", humidity: 65, windSpeed: 13, icon: "sun" } },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 15, icon: "sun" } },
  { code: "VC", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", weather: { temp: 27, condition: "Sunny", humidity: 70, windSpeed: 14, icon: "sun" } },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", weather: { temp: 29, condition: "Sunny", humidity: 72, windSpeed: 11, icon: "sun" } },
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", weather: { temp: 28, condition: "Sunny", humidity: 65, windSpeed: 14, icon: "sun" } },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", weather: { temp: 27, condition: "Sunny", humidity: 70, windSpeed: 15, icon: "sun" } },
  { code: "BZ", name: "Belize", flag: "🇧🇿", weather: { temp: 28, condition: "Sunny", humidity: 75, windSpeed: 10, icon: "sun" } },
  { code: "GD", name: "Grenada", flag: "🇬🇩", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "HT", name: "Haiti", flag: "🇭🇹", weather: { temp: 29, condition: "Sunny", humidity: 75, windSpeed: 12, icon: "sun" } },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", weather: { temp: 30, condition: "Sunny", humidity: 72, windSpeed: 10, icon: "sun" } },
  { code: "MQ", name: "Martinique", flag: "🇲🇶", weather: { temp: 28, condition: "Sunny", humidity: 70, windSpeed: 13, icon: "sun" } },
  { code: "GP", name: "Guadeloupe", flag: "🇬🇵", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 14, icon: "sun" } },
  { code: "RE", name: "Réunion", flag: "🇷🇪", weather: { temp: 26, condition: "Sunny", humidity: 65, windSpeed: 15, icon: "sun" } },
  { code: "YT", name: "Mayotte", flag: "🇾🇹", weather: { temp: 27, condition: "Sunny", humidity: 68, windSpeed: 12, icon: "sun" } },
  { code: "NC", name: "New Caledonia", flag: "🇳🇨", weather: { temp: 25, condition: "Sunny", humidity: 65, windSpeed: 13, icon: "sun" } },
  { code: "PF", name: "French Polynesia", flag: "🇵🇫", weather: { temp: 28, condition: "Sunny", humidity: 68, windSpeed: 11, icon: "sun" } },
  { code: "WF", name: "Wallis and Futuna", flag: "🇼🇫", weather: { temp: 27, condition: "Sunny", humidity: 70, windSpeed: 14, icon: "sun" } },
  { code: "PM", name: "Saint Pierre and Miquelon", flag: "🇵🇲", weather: { temp: 12, condition: "Cloudy", humidity: 75, windSpeed: 20, icon: "cloud" } },
  { code: "TF", name: "French Southern Territories", flag: "🇹🇫", weather: { temp: 5, condition: "Snow", humidity: 85, windSpeed: 25, icon: "snow" } },
  { code: "HM", name: "Heard Island and McDonald Islands", flag: "🇭🇲", weather: { temp: 5, condition: "Snow", humidity: 88, windSpeed: 30, icon: "snow" } },
  { code: "AQ", name: "Antarctica", flag: "🇦🇶", weather: { temp: -20, condition: "Snow", humidity: 95, windSpeed: 35, icon: "snow" } },
];

export default function BackgroundSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserBackground();
  }, [user]);

  const loadUserBackground = async () => {
    try {
      if (!user) return;
      const data = await apiClient.get<any | null>(`/api/users/${user.id}/settings`);
      if (data?.background_country) {
        const country = countries.find(c => c.code === data.background_country);
        if (country) setSelectedCountry(country);
      }
    } catch (error) {
      console.error('Unable to load your background preferences. Using default settings.');
    }
  };

  const saveBackground = async (country: Country) => {
    setLoading(true);
    try {
      await apiClient.put(`/api/users/${user!.id}/settings`, {
        background_country: country.code
      });
      
      setSelectedCountry(country);
      
      // Apply background to document
      applyBackground(country);
      
      toast({
        title: "Background Updated",
        description: `Your background has been set to ${country.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Update",
        description: "There was an error updating your background. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyBackground = (country: Country) => {
    const root = document.documentElement;
    
    // Set CSS variables based on weather
    root.style.setProperty('--bg-primary', getBackgroundColor(country.weather.icon));
    root.style.setProperty('--bg-secondary', getSecondaryColor(country.weather.icon));
    root.style.setProperty('--weather-temp', `${country.weather.temp}°C`);
    root.style.setProperty('--weather-condition', country.weather.condition);
  };

  const getBackgroundColor = (icon: string): string => {
    switch (icon) {
      case "sun": return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      case "cloud": return "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)";
      case "rain": return "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)";
      case "snow": return "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)";
      case "wind": return "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
      default: return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  };

  const getSecondaryColor = (icon: string): string => {
    switch (icon) {
      case "sun": return "rgba(255, 255, 255, 0.1)";
      case "cloud": return "rgba(255, 255, 255, 0.15)";
      case "rain": return "rgba(255, 255, 255, 0.05)";
      case "snow": return "rgba(0, 0, 0, 0.02)";
      case "wind": return "rgba(255, 255, 255, 0.2)";
      default: return "rgba(255, 255, 255, 0.1)";
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Custom Background
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a country background based on real-time weather conditions
          </p>
        </div>
        {selectedCountry && (
          <Badge className="bg-gradient-brand text-primary-foreground border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            {selectedCountry.name}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/50 border border-border/30">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search countries..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>

      {/* Current Selection */}
      {selectedCountry && (
        <Card className="glass-card border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedCountry.flag}</div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{selectedCountry.name}</h3>
                  <p className="text-sm text-muted-foreground">Currently selected background</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Thermometer className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{selectedCountry.weather.temp}°C</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedCountry.weather.condition}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const WeatherIcon = weatherIcons[selectedCountry.weather.icon];
                    return <WeatherIcon className="w-6 h-6 text-primary" />;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Country Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map((country, index) => {
          const isSelected = selectedCountry?.code === country.code;
          const WeatherIcon = weatherIcons[country.weather.icon];
          
          return (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "glass-card border-border/30 cursor-pointer transition-all hover:shadow-medium group",
                  isSelected && "ring-2 ring-primary/30 border-primary/30"
                )}
                onClick={() => saveBackground(country)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{country.name}</h3>
                        <p className="text-xs text-muted-foreground">{country.code}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <WeatherIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{country.weather.temp}°C</p>
                        <p className="text-[10px] text-muted-foreground">{country.weather.condition}</p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground">
                      <p>💧 {country.weather.humidity}%</p>
                      <p>💨 {country.weather.windSpeed} km/h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Weather Info */}
      <Card className="glass-card border-border/30 bg-gradient-to-br from-cyan/5 to-purple/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">About Custom Backgrounds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Select a country to personalize your learning environment with realistic weather-based backgrounds. 
                The theme colors and atmosphere will dynamically adjust based on the selected country's current weather conditions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">195 Countries Available</Badge>
                <Badge variant="secondary" className="text-xs">Real-time Weather</Badge>
                <Badge variant="secondary" className="text-xs">Dynamic Themes</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
