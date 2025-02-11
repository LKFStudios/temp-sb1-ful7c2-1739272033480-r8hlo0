import React from 'react';
import { Gender } from '../../types';

interface BackgroundImageProps {
  gender: Gender;
  children: React.ReactNode;
}

export function BackgroundImage({ gender, children }: BackgroundImageProps) {
  const backgroundImage = gender === 'female' 
    ? "url('https://cdn.discordapp.com/attachments/1071673439154339893/1324269216450220092/IMG_9918.jpg?ex=679d1c10&is=679bca90&hm=8de35c412b1c142eabe66098b231882a56e1843fdced9903fd687268884bf48e&')"
    : "url('https://cdn.discordapp.com/attachments/1071673439154339893/1324269368275636326/image0.jpg?ex=679d1c35&is=679bcab5&hm=2a339ad00608b4fa9370eb3f1478d5bed92fd0275c646cb52d3d1f3be676f6dd&')";

  return (
    <div 
      className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-cover bg-center mb-6"
      style={{ backgroundImage }}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
        {children}
      </div>
    </div>
  );
}