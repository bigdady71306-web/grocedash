# 🛒 GroceDash

Family Meal Planning & Grocery Tracker — Higginbotham Edition

## Live App
[https://grocedash.vercel.app](https://grocedash.vercel.app)

## Features
- 🍽️ **7-Day Meal Planner** — Pick from 6 pre-loaded family recipes (Sun–Sat)
- 🛒 **Smart Grocery List** — Auto-generates from meal plan + always-buy staples
- 💰 **Budget Tracker** — Real HEB prices, color-coded budget bar
- 📋 **50+ HEB Prices** — Auto-suggest as you type items
- 📅 **Trip History** — Save every shopping trip with budget vs. spent
- 🔐 **Private per family** — Supabase auth + RLS

## Setup

### 1. Supabase Tables
Run `setup.sql` in your Supabase Dashboard → SQL Editor

### 2. Default Recipes Included
1. 🍔 Smash Burgers
2. 🍗 BBQ Chicken Breast
3. 🌮 Beef Tacos
4. 🍝 Spaghetti & Homemade Meat Sauce
5. 🍝 Chicken Alfredo
6. 🧀 Beef Nachos Night

### 3. Default Staples (always on list)
- Purina ONE Chicken & Rice 8lb ($16.28)
- Milk-Bone 60oz ($8.98)
- Q-tips 500ct ($2.98)
- Gallon whole milk ($3.66)
- Eggs 30pk ($7.50)
- Butter x2 ($7.56)
- White Monster 12pk ($23.98)
- Red Bull SF 12pk ($21.98)

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (zero dependencies except Supabase)
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Deploy:** Vercel

## Family
- Jeremiah, Amy, Jamie (17), Johnny (13), JJ (10)
- Dietary: No seafood, minimal vegetables
- Store: HEB — N. Frazier, Conroe TX
- Budget: $250/week
