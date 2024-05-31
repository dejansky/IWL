import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import ttest_ind

# Load the CSV data into a pandas DataFrame
df = pd.read_csv('./SanitizedData/records_w.csv')


# Get the 'ACR' values for the 'error' and 'no error' groups
group_false = df[df['error'] == False]['ACR']
group_true = df[df['error'] == True]['ACR']

# Calculate means
mean_false = np.mean(group_false)
mean_true = np.mean(group_true)

# Calculate standard deviations
std_false = np.std(group_false, ddof=1)
std_true = np.std(group_true, ddof=1)

# Perform t-test
t_stat, p_val = ttest_ind(group_false, group_true)
print(f"t-Statistic: {t_stat}, p-Value: {p_val}")

if p_val < 0.05:
    print("Reject the null hypothesis: Significant difference between the groups")
else:
    print("Fail to reject the null hypothesis: No significant difference between the groups")