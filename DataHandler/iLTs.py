import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load your data into a DataFrame (replace 'data.csv' with your actual file path)
df = pd.read_csv('./SanitizedData/records_combined.csv')

# Assume 'iLT' column contains the interaction latency times
# Filter the data if necessary (e.g., based on certain conditions)
filtered_data = df['miLT']  # Modify this line if you have specific conditions

# Convert 'iLT' from milliseconds to seconds if needed
filtered_data = filtered_data / 1000

# Calculate the mean interaction latency time (iLT_pq)
iLT_pq = filtered_data.mean()

# Print the calculated mean iLT
print(f'iLT_pq: {iLT_pq:.2f} seconds')

# Visualization
plt.figure(figsize=(10, 6))
plt.plot(filtered_data, marker='o', linestyle='None', label='iLT values')
plt.axhline(y=iLT_pq, color='r', linestyle='--', label=f'Mean iLT (iLT_pq): {iLT_pq:.2f} seconds')
plt.title('Interaction Latency Times (iLT) and Mean iLT')
plt.xlabel('Observation Index')
plt.ylabel('iLT (seconds)')
plt.legend()
plt.show()
