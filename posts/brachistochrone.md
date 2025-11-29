### Background
The **Brachistochrone curve** is the curve of fastest descent. While the analytical solution (a cycloid) is well known, solving it numerically using Finite Element Analysis (FEA) provides a robust framework for more complex constraints.

$$
T = \int_{x_A}^{x_B} \frac{\sqrt{1 + (y')^2}}{\sqrt{2gy}} dx
$$

In this honors project, I discretized the domain using **P2 elements** and applied **Gaussian quadrature** for integral approximation.

### Optimization
We used the **L-BFGS-B** algorithm to minimize the travel time functional. The results showed close agreement with the analytical solution.