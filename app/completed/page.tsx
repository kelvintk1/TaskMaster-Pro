"use client";

import { useEffect, useState } from "react";
import { GlowCard } from "../components/spotlight-card";
import { ProgressBar } from "../components/progress-bar";
import {CountUp} from "../components/count-up"; 
import { animate, useMotionValue, useTransform } from "framer-motion";
import { BorderBeam } from '../components/borderBeam';
import Checkbox from "../components/checkBox";
import Image from "next/image";

export default function CompletedPage() {
  const totalTasks = 100;
  const targetValue = 50; // Target completed tasks
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // Animate the progress value
  useEffect(() => {
    const controls = animate(0, targetValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => {
        setAnimatedValue(Math.floor(value));
      },
    });
    
    return () => controls.stop();
  }, [targetValue]);

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <span className=''>
          <p className='text-3xl font-bold'> Completed Tasks</p>
          <p className="text-blue-400">Every checkmark ✓ is a milestone. Browse your archive of accomplished tasks.</p>
        </span>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col justify-center gap-2">
            <span className="flex items-center justify-center gap-3 w-full">
              <span className="text-xl font-semibold">
                <CountUp 
                  value={targetValue}
                  duration={1.5}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                  className="text-3xl"
                  numberClassName="text-3xl font-bold"
                />
              </span>
              <span className="text-sm italic">out of</span>
              <span className="text-xl font-semibold">
                 <CountUp 
                  value={totalTasks}
                  duration={1.5}
                  colorScheme="custom"
                  customColor="#1814ee"
                  animationStyle="spring"
                  className="text-2xl"
                  numberClassName="text-2xl font-semibold"
                />
              </span>
            </span>
            <span className="text-center text-sm text-gray-500">
              Tasks completed for this month (March)
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="">
            <ProgressBar
              max={totalTasks}
              min={0}
              value={animatedValue}
              gaugePrimaryColor="#0804f3"
              gaugeSecondaryColor="#aebcfc54"
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="flex w-full items-center justify-around gap-4 mt-4 flex-wrap">
        <GlowCard glowColor='purple' size='lg' customSize className='w-[200px] h-[120px] rounded-xl bg-[#233648]'>
          <div className="w-full h-full flex flex-col">
            <span className="flex justify-between">
              <p className="text-sm">Total</p>
              <Image src="/all.png" alt="all icon" width={20} height={20} />
            </span>
            <span className="text-3xl text-center font-bold text-blue-700 mt-1">
              <CountUp 
                value={200}
                interactive={true}
                colorScheme="custom"
                customColor="#1814ee"
                animationStyle="spring"
              />
            </span>
            <span className="text-sm text-center mt-1">Tasks Completed</span>
          </div>
        </GlowCard>
        <GlowCard glowColor='orange' size='lg' customSize className='w-[200px] h-[120px] rounded-xl bg-[#233648]'>
          <div className="w-full h-full flex flex-col">
            <span className="flex justify-between">
              <p className="text-sm">This week</p>
              <Image src="/week.png" alt="all icon" width={20} height={20} />
            </span>
            <span className="text-3xl text-center font-bold text-blue-700 mt-1">
              <CountUp 
                value={60}
                interactive={true}
                colorScheme="custom"
                customColor="#1814ee"
                animationStyle="spring"
              />
            </span>
            <span className="text-sm text-center mt-1">Tasks Completed</span>
          </div>
        </GlowCard>
        <GlowCard glowColor='blue' size='lg' customSize className='w-[200px] h-[120px] rounded-xl bg-[#233648]'>
          <div className="w-full h-full flex flex-col">
            <span className="flex justify-between">
              <p className="text-sm">Priority</p>
              <Image src="/star.png" alt="all icon" width={20} height={20} />
            </span>
            <span className="text-3xl text-center font-bold text-blue-700 mt-1">
              <CountUp 
                value={10}
                interactive={true}
                colorScheme="custom"
                customColor="#1814ee"
                animationStyle="spring" 
              />
            </span>
            <span className="text-sm text-center mt-1">Tasks Completed</span>
          </div>
        </GlowCard>
      </div>
      
      <div className="flex flex-col gap-4 p-6 mt-4 overflow-y-auto no-scrollbar h-[calc(100vh-350px)]">
          <div className="flex flex-col gap-2">
            {/* line 1*/}
            <div className="flex items-center gap-4">
              <span className="w-30 font-bold italic">
                Today
              </span>
              <div className="flex-1 border-t border-gray-500 flex justify-center" aria-hidden="true"></div>
              <span className="pl-26 flex items-center justify-end">
                <p className="font-bold bg-black/60 rounded-full px-2">2</p>
              </span>
            </div>
            {/* Completed tasks A1*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] gap-4 bg-[#233648] rounded-xl p-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl text-gray-500 font-bold flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center">
                      <span className="text-sm text-[#92adc9]">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span>

                {/* <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span> */}
              </div>
          </div>

            {/* Completed tasks A2*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                {/* <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span> */}

                <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span>
              </div>
          </div>
            {/* line 2*/}
            <div className="flex items-center gap-4">
              <span className="w-30 font-bold italic">
                Yesterday
              </span>
              <div className="flex-1 border-t border-gray-500 flex justify-center" aria-hidden="true"></div>
              <span className="pl-26 flex items-center justify-end">
                <p className="font-bold bg-black/60 rounded-full px-2">3</p>
              </span>
            </div>
            {/* Completed tasks B1*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                {/* <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span> */}

                <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span>
              </div>
          </div>
            {/* Completed tasks B2*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span>

                {/* <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span> */}
              </div>
          </div>
            {/* Completed tasks B3*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                {/* <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span> */}

                <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span>
              </div>
          </div>
            {/* line 3*/}
            <div className="flex items-center gap-4">
              <span className="w-30 font-bold italic">
                February 21
              </span>
              <div className="flex-1 border-t border-gray-500 flex justify-center" aria-hidden="true"></div>
              <span className="pl-26 flex items-center justify-end">
                <p className="font-bold bg-black/60 rounded-full px-2">5</p>
              </span>
            </div>
            {/* Completed tasks C1*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span>

                {/* <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span> */}
              </div>
          </div>
            {/* Completed tasks C2*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                {/* <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span> */}

                <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span>
              </div>
          </div>
            {/* Completed tasks C3*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span>

                {/* <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span> */}
              </div>
          </div>
            {/* Completed tasks C4*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>@ 11:00 PM</p>
                </span>

                {/* <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span> */}
              </div>
          </div>
            {/* Completed tasks C5*/}
            <div className="relative grid grid-cols-[1fr_auto_auto_auto] bg-[#233648] rounded-xl p-4 gap-4 px-6">
              <BorderBeam 
                  colorFrom="#2563EB" 
                  colorTo="#2563EB"
                  size={50}
                  duration={6}
                  borderThickness={2}
                  glowIntensity={3}
              />
              
              {/* Priority Star - Show only if completed task was prioritized */}
                  <Image 
                      src="/star.gif" 
                      alt="priority" 
                      width={40} 
                      height={40} 
                      className="absolute -top-4 -left-3 rotate-25"
                  />
              
              {/* left side */} 
              <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                      <Checkbox />
                  </div>
                  <div>
                      {/* Completed task title */}
                      <p className="text-xl font-bold text-gray-500 flex items-center gap-2">
                          Figma Project
                      </p>
                      {/* Completed task description */}
                      <p className="text-sm text-[#92adc9]">Have to start working on the figma design</p>
                  </div>
              </div>
              
              {/* middle side */}
              <div className="flex flex-col items-center">
                  {/* Date created */}
                  <div className="flex items-center gap-1">
                      <span>
                          <Image src="/calendar.png" alt="calendar icon" width={18} height={18} />
                      </span>
                      <span className="text-sm text-[#92adc9]">
                          Created 22/03/2026
                      </span>
                  </div>
                  {/* Due date */}
                  <div className="flex flex-col items-center text-[#92adc9]">
                      <span className="text-sm">
                          Due 23/03/2026
                      </span>
                      <span className="text-sm">
                          @ 11:00 PM
                      </span>
                  </div>
              </div>
              
              {/* right side */}
              <div className="flex flex-col items-center">
                  {/* Date Completed */}
                  <div className="flex flex-col justify-center items-center">
                      <span>
                          <Image src="/stopwatch.png" alt="calendar icon" width={20} height={20} />
                      </span>
                      <span className="text-center text-sm text-[#c99292]">
                        Completed @ 11:30 PM
                      </span>
                  </div>
                  {/* Duration */}
                  <div className="flex gap-2 items-center">
                      <span className="text-sm text-center text-[#c99292] pl-6">
                          Duration: 2 days
                      </span>
                  </div>
              </div>
              {/* last side */}
              <div className="text-sm text-[#92adc9]">
                {/* <span className="flex flex-col justify-center items-center">
                  <span>
                    <Image src="/remind1.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Reminded 03/21/2026</p>
                  <p>Reminded @ 11:00 PM</p>
                </span> */}

                <span className="flex flex-col items-center justify-center gap-2">
                  <span>
                    <Image src="/remind.png" alt="reminder icon" width={18} height={18} />
                  </span>
                  <p>Not Reminded</p>
                </span>
              </div>
          </div>

          </div>
      </div>
    </div>
  );
}