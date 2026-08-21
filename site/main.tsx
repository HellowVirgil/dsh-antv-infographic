import React from 'react'
import { createRoot } from 'react-dom/client'
import { InfographicBlock } from '../src/client/InfographicBlock.tsx'
import { ensureInfographicStyles } from '../src/client/styles.ts'

ensureInfographicStyles()

const source = `infographic sequence-timeline-rounded-rect-node
theme antv
data
  title AI 产品规模化路线图
  desc 从问题发现到持续增长
  sequences
    - label 用户调研
      desc 识别高价值问题与核心使用场景
      icon user research
    - label 原型验证
      desc 用可交互原型验证价值与体验
      icon prototype
    - label 小流量发布
      desc 建立指标体系并控制风险
      icon launch metrics
    - label 规模化增长
      desc 产品、模型与运营协同迭代
      icon growth
    - label 生态扩展
      desc 开放能力并形成合作网络
      icon ecosystem`

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <InfographicBlock source={source} settled />
  </React.StrictMode>,
)
