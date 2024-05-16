import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV data into a pandas DataFrame
df = pd.read_csv('./SanitizedData/records_combined.csv')

# Convert 'net_delay' from "number+ms" format to seconds
df['net_delay'] = df['net_delay'].str.rstrip('ms').astype(float)

# Visualize the net_delay for each ACR with a scatter plot
plt.figure(figsize=(10, 6))

# Plot the scores where error is False
plt.scatter(df[df['error'] == False]['net_delay'], df[df['error'] == False]['ACR'], color='blue', label='No Error', alpha=0.5)

# Plot the scores where error is True
plt.scatter(df[df['error'] == True]['net_delay'], df[df['error'] == True]['ACR'], color='red', label='Error', alpha=0.5)

plt.title('Data for combined written and visual instructions')
plt.xlabel('Net Delay (ms)')
plt.ylabel('MOS')
plt.legend()
plt.show()