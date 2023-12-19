# Grepolis Attack Log Analyzer

## Overview

This script is designed for analyzing attack logs in the Grepolis game, particularly for administrative purposes. It processes attack data from in-game logs, identifying potential rule violations such as spam attacks and retreat attacks, calculating average populations, travel times, and detecting takeover attempts.

## Features

- **Attack Log Processing**: Extracts detailed information from in-game attack logs.
- **Rule Violation Detection**:
  - Identifies spam attacks based on the frequency and target of attacks.
  - Marks retreat attacks and distinguishes them based on arrival status.
- **Population and Travel Time Analysis**:
  - Calculates the average population of attack units.
  - Computes average travel times for attacks.
- **Takeover Attempt Identification**: Highlights rows where takeover attempts have occurred.
- **Interactive UI**: Provides a user-friendly popup interface within the game environment, complete with folding and filter options.
- **City Details**: Offers an option to view detailed attack information on a city-by-city basis.

## Installation

1. Install a user script manager like Tampermonkey or Greasemonkey in your web browser.
2. Create a new user script and paste the entire code of this project into it.
3. Save the script and ensure it's enabled in the user script manager.

## Usage

Once installed, the script automatically activates on the relevant Grepolis admin pages. It analyzes the attack logs and displays a popup interface with summarized data and various interactive options.

## Customization

The script can be customized to suit specific administrative needs. Modify the constants and functions at the beginning of the script to change the behavior and analysis criteria.

## Disclaimer

This script is developed for administrative use within the Grepolis game. Ensure compliance with the game's terms and policies when using or modifying this script.

## Author

Luuk Sterke
