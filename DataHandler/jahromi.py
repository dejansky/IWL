import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV data into a pandas DataFrame
df = pd.read_csv('./SanitizedData/jahromidata.csv')

# Convert 'miLT' from milliseconds to seconds
df['miLT'] = df['miLT'] / 1000

# Group the DataFrame by 'ACR' and calculate the mean 'miLT' for each group
average_miLT = df.groupby('ACR')['miLT'].mean()

# Transpose the data for swapping the axes
average_miLT = average_miLT.reset_index().set_index('miLT')

# Create a new figure
plt.figure(figsize=(10, 6))

# Plot the average 'miLT' for each 'ACR' as a line plot with dots at each data point
average_miLT.plot(marker='o')

# Set the title and labels
plt.title('Average miLT for each ACR')
plt.xlabel('mean miLT (s)')
plt.ylabel('ACR')

# Show the plot
plt.show()