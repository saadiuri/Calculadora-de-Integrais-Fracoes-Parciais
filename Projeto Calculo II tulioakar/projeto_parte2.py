import tkinter as tk
from tkinter import ttk
import sympy as sp
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
from PIL import Image, ImageTk
import numpy as np
import re

# Função para processar e formatar a entrada da função
def formatar_funcao(entrada_funcao):
    entrada_funcao = entrada_funcao.replace("–", "-")
    entrada_funcao = entrada_funcao.replace("^", "**")
    entrada_funcao = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', entrada_funcao)
    x = sp.symbols('x')
    funcao = sp.sympify(entrada_funcao)
    funcao_simplificada = sp.collect(sp.simplify(funcao), x)
    expressao_latex = sp.latex(funcao_simplificada)
    plt.figure(figsize=(6, 1.5))
    plt.text(0.5, 0.5, f"$f(x) = {expressao_latex}$", ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("funcao.png", format="png", bbox_inches='tight', dpi=100)
    plt.close()
    img = Image.open("funcao.png")
    img_tk = ImageTk.PhotoImage(img)
    resultado_funcao.config(image=img_tk)
    resultado_funcao.image = img_tk
    return funcao_simplificada

# Função para calcular e exibir a integral indefinida
def calcular_integral_indefinida(funcao_simplificada):
    x = sp.symbols('x')
    integral_indefinida = sp.integrate(funcao_simplificada, x)
    integral_latex = sp.latex(integral_indefinida) + " + C"
    plt.figure(figsize=(6, 1.5))
    plt.text(0.5, 0.5, f"$\\int f(x) \\,dx = {integral_latex}$", ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("integral_indefinida.png", format="png", bbox_inches='tight', dpi=100)
    plt.close()
    img = Image.open("integral_indefinida.png")
    img_tk = ImageTk.PhotoImage(img)
    resultado_integral.config(image=img_tk)
    resultado_integral.image = img_tk

# Função para calcular e exibir a integral definida
def calcular_integral_definida(funcao_simplificada, a, b):
    x = sp.symbols('x')
    integral_definida = sp.integrate(funcao_simplificada, (x, a, b))
    integral_definida_str = f"{integral_definida:.0f}" if integral_definida == int(integral_definida) else f"{integral_definida:.6f}".rstrip('0').rstrip('.')
    expressao_integral_definida = f"$\\int_{{{int(a) if a == int(a) else a}}}^{{{int(b) if b == int(b) else b}}} f(x) \\, dx = {integral_definida_str}$"
    plt.figure(figsize=(6, 1.5))
    plt.text(0.5, 0.5, expressao_integral_definida, ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("integral_definida.png", format="png", bbox_inches='tight', dpi=100)
    plt.close()
    img_integral_definida = Image.open("integral_definida.png")
    img_tk_integral_definida = ImageTk.PhotoImage(img_integral_definida)
    resultado_integral_definida.config(image=img_tk_integral_definida)
    resultado_integral_definida.image = img_tk_integral_definida

# Função para plotar a função e a área da integral definida
def plotar_funcao(funcao_simplificada, a=None, b=None):
    for widget in frame_plot.winfo_children():
        widget.destroy()
    
    x = sp.symbols('x')
    f_np = sp.lambdify(x, funcao_simplificada, 'numpy')
    x_vals = np.linspace(-10, 10, 400)
    y_vals = f_np(x_vals)
    
    fig, ax = plt.subplots()
    ax.plot(x_vals, y_vals, label="f(x)", color="blue")
    ax.axhline(0, color='black', linewidth=0.5)
    ax.axvline(0, color='black', linewidth=0.5)
    ax.grid()

    # Se os valores de 'a' e 'b' forem fornecidos, sombreia a área entre eles
    if a is not None and b is not None:
        x_fill = np.linspace(a, b, 100)
        y_fill = f_np(x_fill)
        ax.fill_between(x_fill, y_fill, color="skyblue", alpha=0.4)
        ax.plot([a, b], [f_np(a), f_np(b)], 'ro')  # Marca os pontos a e b
        ax.text(a, f_np(a), f"({a}, {f_np(a):.2f})", ha='center')
        ax.text(b, f_np(b), f"({b}, {f_np(b):.2f})", ha='center')

    canvas = FigureCanvasTkAgg(fig, master=frame_plot)
    toolbar = NavigationToolbar2Tk(canvas, frame_plot)
    toolbar.update()
    canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
    canvas.draw()

# Função para calcular e plotar
def calcular_e_plotar():
    entrada = entrada_funcao.get()
    funcao_simplificada = formatar_funcao(entrada)
    calcular_integral_indefinida(funcao_simplificada)
    
    a_text = entrada_a.get().strip()
    b_text = entrada_b.get().strip()
    
    if a_text and b_text:
        try:
            a = float(a_text)
            b = float(b_text)
            calcular_integral_definida(funcao_simplificada, a, b)
            plotar_funcao(funcao_simplificada, a, b)  # Plota com a área sombreada
        except ValueError:
            resultado_integral_definida.config(text="Valores inválidos para a ou b.")
    else:
        plotar_funcao(funcao_simplificada)  # Plota sem a área sombreada

# Interface gráfica
root = tk.Tk()
root.title("Projeto Cálculo II")
root.geometry("1200x800")

main_frame = tk.Frame(root)
main_frame.pack(fill=tk.BOTH, expand=True)

left_frame = tk.Frame(main_frame, width=400)
left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)

frame_plot = tk.Frame(main_frame, width=800, height=600)
frame_plot.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

label_funcao = tk.Label(left_frame, text="Digite a função polinomial em x:")
label_funcao.pack(pady=5)
entrada_funcao = tk.Entry(left_frame, width=30, font=("Arial", 14))
entrada_funcao.pack(pady=5)

botoes_frame = tk.Frame(left_frame)
botoes_frame.pack(pady=5)
operadores = [('x', 'x'), ('x²', '**2'), ('+', '+'), ('-', '-'), ('*', '*'), ('/', '/'), ('^', '**'), ('√', 'sqrt('), ('(', '('), (')', ')')]
for texto, valor in operadores:
    button = tk.Button(botoes_frame, text=texto, width=5, height=2, command=lambda valor=valor: entrada_funcao.insert(tk.END, valor))
    button.pack(side=tk.LEFT, padx=2, pady=2)

botao_limpar = tk.Button(left_frame, text="Limpar", command=lambda: entrada_funcao.delete(0, tk.END), width=10)
botao_limpar.pack(pady=5)

label_valores_a = tk.Label(left_frame, text="Digite os valores de 'a' e 'b' para a integral definida:")
label_valores_a.pack(pady=5)
entrada_a = tk.Entry(left_frame, width=10)
entrada_a.pack(pady=2)
entrada_b = tk.Entry(left_frame, width=10)
entrada_b.pack(pady=2)

botao_calcular = tk.Button(left_frame, text="Calcular e Plotar", command=calcular_e_plotar)
botao_calcular.pack(pady=10)

label_resultado_funcao = tk.Label(left_frame, text="Função Formatada:")
label_resultado_funcao.pack(pady=5)
resultado_funcao = tk.Label(left_frame)
resultado_funcao.pack(pady=5)

label_integral_indefinida = tk.Label(left_frame, text="Integral Indefinida:")
label_integral_indefinida.pack(pady=5)
resultado_integral = tk.Label(left_frame)
resultado_integral.pack(pady=5)

label_integral_definida = tk.Label(left_frame, text="Integral Definida:")
label_integral_definida.pack(pady=5)
resultado_integral_definida = tk.Label(left_frame)
resultado_integral_definida.pack(pady=5)

root.mainloop()
