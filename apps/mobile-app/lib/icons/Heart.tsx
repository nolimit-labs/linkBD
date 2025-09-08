import React from 'react'
import { Heart as HeartRN } from 'lucide-react-native'
import { iconWithClassName } from './iconWithClassName'
iconWithClassName(HeartRN)
export const Heart = HeartRN as unknown as React.ComponentType<any>