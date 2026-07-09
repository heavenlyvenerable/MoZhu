---
id: "post_20260709_34dd0cc5"
type: "post"
title: "Markdown公式渲染全量测试"
slug: "Markdown公式渲染全量测试"
date: "2026-07-09"
category: "问学录"
status: "draft"
visible: true
createdAt: "2026-07-09T06:56:51.450Z"
updatedAt: "2026-07-09T06:39:10.241Z"
wordCount: 1241
importedPath: "content/posts/问学录/Markdown公式渲染全量测试.md"
summary: "用于验证前端 Markdown 页面中 KaTeX 公式渲染能力的完整测试文稿，覆盖行内公式、块级公式、矩阵、分段函数、积分、概率、优化与物理方程等常见场景。"
---
# Markdown 公式渲染全量测试

这篇文稿专门用来检查文章页对数学公式的支持。正文里可以混排行内公式，例如质能方程 $E=mc^2$、勾股定理 $a^2+b^2=c^2$、黄金分割 $\varphi=\frac{1+\sqrt{5}}{2}$，也可以在同一段中混入英文变量 $x_i,y_i,\theta,\lambda$ 与中文说明。

普通文本中的反斜杠转义应保持正常，例如价格符号可以写成 \$5；而数学公式内部可以保留下标、上标、希腊字母、分数和根式：$\alpha_1+\beta^2=\sqrt[n]{x}+\frac{a}{b}$。

## 基础代数

二次方程求根公式：

$$
x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}
$$

多项式展开：

$$
(x+y)^n=\sum_{k=0}^{n}\binom{n}{k}x^{n-k}y^k
$$

等比数列求和：

$$
\sum_{i=0}^{n}ar^i=a\frac{1-r^{n+1}}{1-r},\quad r\ne 1
$$

## 极限与微积分

经典极限：

$$
\lim_{x\to 0}\frac{\sin x}{x}=1
$$

导数与偏导：

$$
\frac{d}{dx}x^n=nx^{n-1},\qquad
\frac{\partial^2 f}{\partial x^2}+\frac{\partial^2 f}{\partial y^2}=\Delta f
$$

定积分、重积分与曲线积分：

$$
\int_{0}^{1}x^2\,dx=\frac{1}{3},\qquad
\iint_{\Omega}(x^2+y^2)\,dA,\qquad
\oint_{\partial\Omega}\mathbf{F}\cdot d\mathbf{r}
$$

分部积分：

$$
\int u\,dv=uv-\int v\,du
$$

## 矩阵与线性代数

矩阵乘法：

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
ax+by \\
cx+dy
\end{bmatrix}
$$

行列式：

$$
\det(A)=
\begin{vmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{vmatrix}
$$

特征值问题：

$$
A\mathbf{v}=\lambda\mathbf{v},\qquad
\det(A-\lambda I)=0
$$

范数与内积：

$$
\lVert \mathbf{x}\rVert_2=\sqrt{\sum_{i=1}^{n}x_i^2},\qquad
\langle \mathbf{x},\mathbf{y}\rangle=\sum_{i=1}^{n}x_iy_i
$$

## 分段函数与方程组

绝对值函数：

$$
|x|=
\begin{cases}
x, & x\ge 0 \\
-x, & x<0
\end{cases}
$$

线性方程组：

$$
\left\{
\begin{aligned}
2x+y-z&=8\\
-3x-y+2z&=-11\\
-2x+y+2z&=-3
\end{aligned}
\right.
$$

对齐推导：

$$
\begin{aligned}
f(x)
&=(x+1)^2-(x-1)^2\\
&=(x^2+2x+1)-(x^2-2x+1)\\
&=4x
\end{aligned}
$$

## 概率与统计

贝叶斯公式：

$$
P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}
$$

期望与方差：

$$
\mathbb{E}[X]=\sum_x xP(X=x),\qquad
\operatorname{Var}(X)=\mathbb{E}\left[(X-\mu)^2\right]
$$

正态分布密度：

$$
f(x)=\frac{1}{\sigma\sqrt{2\pi}}
\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
$$

协方差矩阵：

$$
\Sigma=
\begin{pmatrix}
\sigma_{11} & \sigma_{12} & \cdots & \sigma_{1n}\\
\sigma_{21} & \sigma_{22} & \cdots & \sigma_{2n}\\
\vdots & \vdots & \ddots & \vdots\\
\sigma_{n1} & \sigma_{n2} & \cdots & \sigma_{nn}
\end{pmatrix}
$$

## 集合、逻辑与离散数学

集合运算：

$$
A\cup B=\{x\mid x\in A\lor x\in B\},\qquad
A\cap B=\{x\mid x\in A\land x\in B\}
$$

量词与蕴含：

$$
\forall \epsilon>0,\ \exists \delta>0,\ 0<|x-a|<\delta \Rightarrow |f(x)-L|<\epsilon
$$

组合恒等式：

$$
\sum_{k=0}^{n}\binom{n}{k}=2^n,\qquad
\binom{n}{k}=\frac{n!}{k!(n-k)!}
$$

递推关系：

$$
F_n=F_{n-1}+F_{n-2},\quad F_0=0,\quad F_1=1
$$

## 优化与机器学习

最小二乘：

$$
\hat{\beta}=\arg\min_{\beta}\lVert y-X\beta\rVert_2^2
$$

梯度下降：

$$
\theta_{t+1}=\theta_t-\eta\nabla_{\theta}J(\theta_t)
$$

交叉熵：

$$
\mathcal{L}=-\sum_{i=1}^{C}y_i\log(\hat{y}_i)
$$

Transformer 注意力：

$$
\operatorname{Attention}(Q,K,V)=
\operatorname{softmax}\left(\frac{QK^\mathsf{T}}{\sqrt{d_k}}\right)V
$$

## 物理方程

麦克斯韦方程组：

$$
\begin{aligned}
\nabla\cdot\mathbf{E} &= \frac{\rho}{\varepsilon_0}\\
\nabla\cdot\mathbf{B} &= 0\\
\nabla\times\mathbf{E} &= -\frac{\partial\mathbf{B}}{\partial t}\\
\nabla\times\mathbf{B} &= \mu_0\mathbf{J}+\mu_0\varepsilon_0\frac{\partial\mathbf{E}}{\partial t}
\end{aligned}
$$

薛定谔方程：

$$
i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t)=
\left[-\frac{\hbar^2}{2m}\nabla^2+V(\mathbf{r},t)\right]\Psi(\mathbf{r},t)
$$

狭义相对论能量关系：

$$
E^2=(pc)^2+(mc^2)^2
$$

## 傅里叶与拉普拉斯变换

傅里叶变换：

$$
\mathcal{F}\{f(t)\}(\omega)=
\int_{-\infty}^{\infty}f(t)e^{-i\omega t}\,dt
$$

逆变换：

$$
f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}
\mathcal{F}\{f\}(\omega)e^{i\omega t}\,d\omega
$$

拉普拉斯变换：

$$
\mathcal{L}\{f(t)\}(s)=\int_{0}^{\infty}e^{-st}f(t)\,dt
$$

## 装饰、括号与字体

大括号与上下标注：

$$
\underbrace{1+1+\cdots+1}_{n\ \text{times}}=n,\qquad
\overbrace{x+\cdots+x}^{m\ \text{terms}}=mx
$$

花体、黑板体与哥特体：

$$
\mathcal{L},\quad \mathbb{R},\quad \mathbb{N},\quad \mathfrak{g},\quad \mathbf{A},\quad \boldsymbol{\theta}
$$

大型定界符：

$$
\left(
\frac{a+b}{c+d}
\right)^2
\le
\left[
\frac{a^2+b^2}{c^2+d^2}
\right]
$$

## 表格、列表与引用中的公式

| 场景 | 行内公式 | 说明 |
| --- | --- | --- |
| 几何 | $S=\pi r^2$ | 圆面积 |
| 速度 | $v=\frac{s}{t}$ | 平均速度 |
| 信息论 | $H(X)=-\sum_xp(x)\log p(x)$ | 熵 |

- 列表中的公式：$g(x)=\frac{1}{1+e^{-x}}$。
- 任务项也应正常显示：$1+2+\cdots+n=\frac{n(n+1)}{2}$。
- 公式旁边的普通强调 **不会** 破坏下标 $a_i$ 与上标 $b^j$。

> 引用中的公式也要能正常显示：$\nabla f(x)=0$ 表示驻点条件。

## 结束

如果这篇文章打开后，行内公式、块级公式、矩阵、分段函数、表格中的公式和引用中的公式都能正常显示，就说明当前文章页的 Markdown 数学渲染链路已经可以支撑日常文稿与学习笔记。
