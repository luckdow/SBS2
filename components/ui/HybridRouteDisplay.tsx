'use client'

import React from 'react';
import GoogleMapsRouteDisplay from './GoogleMapsRouteDisplay';

interface HybridRouteDisplayProps {
  origin: string;
  destination: string;
  originPlace?: google.maps.places.PlaceResult;
  destinationPlace?: google.maps.places.PlaceResult;
  onRouteCalculated?: (result: {
    distance: number;
    duration: number;
    distanceText: string;
    durationText: string;
  }) => void;
}

export default function HybridRouteDisplay({ 
  origin, 
  destination, 
  originPlace, 
  destinationPlace,
  onRouteCalculated
}: HybridRouteDisplayProps) {
  return (
    <GoogleMapsRouteDisplay
      origin={origin}
      destination={destination}
      originPlace={originPlace}
      destinationPlace={destinationPlace}
      onRouteCalculated={onRouteCalculated}
    />
  );
}