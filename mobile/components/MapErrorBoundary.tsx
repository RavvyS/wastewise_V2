import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Map component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Map Error</Text>
          <Text style={styles.errorMessage}>
            There was an issue loading the map. This could be due to:
          </Text>
          <Text style={styles.errorDetails}>
            • Missing Google Maps API key{"\n"}• Network connectivity issues
            {"\n"}• Platform compatibility issues
          </Text>
          <Text style={styles.errorSuggestion}>
            Please try refreshing or use the mobile app for full map
            functionality.
          </Text>
        </View>
      );
    }

    return <>{this.props.children}</>;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#c62828",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: "#666",
    textAlign: "left",
    marginBottom: 12,
    lineHeight: 16,
  },
  errorSuggestion: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default MapErrorBoundary;
