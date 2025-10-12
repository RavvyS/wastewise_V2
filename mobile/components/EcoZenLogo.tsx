import React from "react";
import { View, StyleSheet, ViewStyle, Image, ImageStyle } from "react-native";

interface EcoZenLogoProps {
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

export const EcoZenLogo: React.FC<EcoZenLogoProps> = ({
  size = "medium",
  style,
}) => {
  const sizeConfig = {
    small: {
      logoWidth: 220,
      logoHeight: 132,
    },
    medium: {
      logoWidth: 320,
      logoHeight: 192,
    },
    large: {
      logoWidth: 420,
      logoHeight: 252,
    },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.container, style]}>
      {/* EcoZen Logo Image */}
      <Image
        source={require("../assets/images/logo.png")}
        style={[
          styles.logoImage,
          {
            width: config.logoWidth,
            height: config.logoHeight,
          },
        ]}
        resizeMode="contain"
      />


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  logoImage: {
    alignSelf: "center",
  } as ImageStyle,
});
