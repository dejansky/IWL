import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

# Load the CSV data into a pandas DataFrame
df = pd.read_csv('./SanitizedData/records_w.csv')

# Convert 'error' column to boolean
df['error'] = df['error'].astype(bool)

# Calculate the overall mean ACR
mean_acr = df['ACR'].mean()

# Visualizing with a Bar Chart of Mean ACR
plt.figure(figsize=(10, 6))

# Plot the mean ACR for each error condition
bar_plot = sns.barplot(x='error', y='ACR', data=df, estimator=np.mean, ci=None, palette=['blue', 'red'])

# Add a horizontal line representing the overall mean ACR
plt.axhline(mean_acr, color='red', linestyle='--')

# Get the height of the bars
bar_heights = [p.get_height() for p in bar_plot.patches]

# Add the mean values on top of the bars
for i, bar_height in enumerate(bar_heights):
    bar_plot.text(i, bar_height, f'{bar_height:.2f}', ha='center', va='bottom')

# Add the overall mean value next to the horizontal line
plt.text(1, mean_acr, f'Overall Mean: {mean_acr:.2f}', va='bottom', color='red')

plt.title('Average ACR by Error Condition (Written Instructions)')
plt.xlabel('Error Occurred')
plt.ylabel('Average ACR')
plt.show()