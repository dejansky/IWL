import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV data into a pandas DataFrame
df = pd.read_csv('./SanitizedData/records_combined.csv')

# Visualize the miLT for each ACR with a scatter plot
plt.figure(figsize=(10, 6))

# Convert 'miLT' from milliseconds to seconds
df['miLT'] = df['miLT'] / 1000

# Plot the scores where error is False
plt.scatter(df[df['error'] == False]['miLT'], df[df['error'] == False]['ACR'], color='blue', label='No Error', alpha=0.5)

# Plot the scores where error is True
plt.scatter(df[df['error'] == True]['miLT'], df[df['error'] == True]['ACR'], color='red', label='Error', alpha=0.5)

plt.title('Data for combined written and visual instructions')
plt.xlabel('Mean iLT (s)')
plt.ylabel('MOS')
plt.legend()
plt.show()