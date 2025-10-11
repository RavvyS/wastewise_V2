import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, StyleProp } from 'react-native';
import React from 'react'; // Explicit React import is standard for TSX

// Define the shape of the component's props
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  // Use StyleProp<ViewStyle> for the style prop, which is a union type
  // that correctly handles single styles, arrays of styles, or undefined/null.
  style?: StyleProp<ViewStyle>; 
  // Use StyleProp<TextStyle> for the textStyle prop.
  textStyle?: StyleProp<TextStyle>;
  // Since you use it in other components:
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, onPress, style, textStyle, disabled = false }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.button, style]} 
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ActionButton;