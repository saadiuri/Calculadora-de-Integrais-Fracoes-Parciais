import tkinter as tk
from tkinter import ttk
import sympy as sp
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
from PIL import Image, ImageTk
import numpy as np
import re

# Configuração para exibir o gráfico no Tkinter
from matplotlib import use
use("TkAgg")

# Função para processar e formatar a entrada da função, com identificação de f(x) ou g(x)
def formatar_funcao(entrada_funcao, is_funcao_f=True):
    entrada_funcao = entrada_funcao.replace("–", "-")
    entrada_funcao = entrada_funcao.replace("^", "**")
    entrada_funcao = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', entrada_funcao)
    x = sp.symbols('x')
    funcao = sp.sympify(entrada_funcao)
    funcao_expandida = sp.expand(funcao)
    expressao_latex = sp.latex(funcao_expandida, order='lex')
    
    plt.figure(figsize=(8, 1.5))
    funcao_label = "f(x)" if is_funcao_f else "g(x)"
    plt.text(0.5, 0.5, f"${funcao_label} = {expressao_latex}$", ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("funcao.png", format="png", bbox_inches='tight', dpi=100, pad_inches=0.1)
    plt.close()
    
    img = Image.open("funcao.png").resize((400, 50), Image.LANCZOS)
    img_tk = ImageTk.PhotoImage(img)
    
    # Condicional para diferenciar os labels de f(x) e g(x)
    if is_funcao_f:
        resultado_funcao_f.config(image=img_tk)
        resultado_funcao_f.image = img_tk
    else:
        resultado_funcao_g.config(image=img_tk)
        resultado_funcao_g.image = img_tk

    return funcao_expandida, expressao_latex

# Funções de cálculo e renderização em LaTeX
def calcular_integral_indefinida(funcao_simplificada):
    x = sp.symbols('x')
    integral_indefinida = sp.integrate(funcao_simplificada, x)
    integral_latex = sp.latex(integral_indefinida) + " + C"
    
    plt.figure(figsize=(8, 1.5))
    plt.text(0.5, 0.5, f"$\\int f(x) \\,dx = {integral_latex}$", ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("integral_indefinida.png", format="png", bbox_inches='tight', dpi=100, pad_inches=0.1)
    plt.close()
    
    img = Image.open("integral_indefinida.png").resize((400, 50), Image.LANCZOS)
    img_tk = ImageTk.PhotoImage(img)
    label_integral_indefinida.config(image=img_tk)
    label_integral_indefinida.image = img_tk

def calcular_integral_definida(funcao_simplificada, a, b):
    x = sp.symbols('x')
    integral_definida = sp.integrate(funcao_simplificada, (x, a, b))
    
    integral_definida_str = f"{integral_definida:.0f}" if integral_definida == int(integral_definida) else f"{integral_definida:.6f}".rstrip('0').rstrip('.')
    expressao_integral_definida = f"$\\int_{{{int(a) if a == int(a) else a}}}^{{{int(b) if b == int(b) else b}}} f(x) \\, dx = {integral_definida_str}$"
    
    plt.figure(figsize=(8, 1.5))
    plt.text(0.5, 0.5, expressao_integral_definida, ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("integral_definida.png", format="png", bbox_inches='tight', dpi=100, pad_inches=0.1)
    plt.close()
    
    img_integral_definida = Image.open("integral_definida.png").resize((400, 50), Image.LANCZOS)
    img_tk_integral_definida = ImageTk.PhotoImage(img_integral_definida)
    resultado_integral_definida.config(image=img_tk_integral_definida)
    resultado_integral_definida.image = img_tk_integral_definida

# Função para calcular e exibir áreas
def calcular_area_riemann(f, g, a, b, n):
    x = sp.symbols('x')
    f_np = sp.lambdify(x, f, 'numpy')
    g_np = sp.lambdify(x, g, 'numpy')
    dx = (b - a) / n
    x_vals = np.linspace(a, b, n)
    area = np.sum(np.abs(f_np(x_vals) - g_np(x_vals)) * dx)
    
    plt.figure(figsize=(8, 1.5))
    plt.text(0.5, 0.5, f"Área por Riemann: {area:.6f}".rstrip('0').rstrip('.'), ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("area_riemann.png", format="png", bbox_inches='tight', dpi=100, pad_inches=0.1)
    plt.close()
    
    img_riemann = Image.open("area_riemann.png").resize((400, 50), Image.LANCZOS)
    img_tk_riemann = ImageTk.PhotoImage(img_riemann)
    resultado_riemann.config(image=img_tk_riemann)
    resultado_riemann.image = img_tk_riemann

def calcular_area_integral(f, g, a, b):
    x = sp.symbols('x')
    area_integral = sp.integrate(sp.Abs(f - g), (x, a, b))
    
    plt.figure(figsize=(8, 1.5))
    plt.text(0.5, 0.5, f"Área por Integral: {area_integral}", ha='center', va='center', fontsize=20)
    plt.axis('off')
    plt.savefig("area_integral.png", format="png", bbox_inches='tight', dpi=100, pad_inches=0.1)
    plt.close()
    
    img_integral_area = Image.open("area_integral.png").resize((400, 50), Image.LANCZOS)
    img_tk_integral_area = ImageTk.PhotoImage(img_integral_area)
    resultado_integral.config(image=img_tk_integral_area)
    resultado_integral.image = img_tk_integral_area

# Função para plotar o gráfico
def plotar_area_entre_funcoes(f, g, a, b):
    for widget in frame_plot.winfo_children():
        widget.destroy()

    x = sp.symbols('x')
    f_np = sp.lambdify(x, f, 'numpy')
    g_np = sp.lambdify(x, g, 'numpy')
    x_vals = np.linspace(float(a), float(b), 400)
    y_f_vals = f_np(x_vals)
    y_g_vals = g_np(x_vals)

    fig, ax = plt.subplots()
    ax.plot(x_vals, y_f_vals, label="f(x)", color="blue")
    ax.plot(x_vals, y_g_vals, label="g(x)", color="green")
    ax.fill_between(x_vals, y_f_vals, y_g_vals, where=(y_f_vals > y_g_vals), color="skyblue", alpha=0.5)
    ax.fill_between(x_vals, y_f_vals, y_g_vals, where=(y_f_vals < y_g_vals), color="lightgreen", alpha=0.5)
    
    ax.plot([a, b], [f_np(a), f_np(b)], 'bo', label="Pontos em f(x)")
    ax.plot([a, b], [g_np(a), g_np(b)], 'go', label="Pontos em g(x)")
    
    ax.axhline(0, color='black', linewidth=0.5)
    ax.axvline(0, color='black', linewidth=0.5)
    ax.legend()
    ax.grid()

    canvas = FigureCanvasTkAgg(fig, master=frame_plot)
    toolbar = NavigationToolbar2Tk(canvas, frame_plot)
    toolbar.update()
    canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
    canvas.draw()

# Função para calcular e plotar
def calcular_e_plotar():
    entrada_f = entrada_funcao_f.get().strip()
    if entrada_f:
        funcao_simplificada, f_latex = formatar_funcao(entrada_f, is_funcao_f=True)
        calcular_integral_indefinida(funcao_simplificada)

    a_text = entrada_a.get().strip()
    b_text = entrada_b.get().strip()
    if entrada_f and a_text and b_text:
        try:
            a = float(a_text)
            b = float(b_text)
            calcular_integral_definida(funcao_simplificada, a, b)
        except ValueError:
            resultado_integral_definida.config(text="Valores inválidos para a ou b.")

    entrada_g = entrada_funcao_g.get().strip()
    n_text = entrada_n.get().strip()
    if entrada_f and entrada_g and a_text and b_text and n_text:
        try:
            g_simplificada, g_latex = formatar_funcao(entrada_g, is_funcao_f=False)
            a = float(a_text)
            b = float(b_text)
            n = int(n_text)
            calcular_area_riemann(funcao_simplificada, g_simplificada, a, b, n)
            calcular_area_integral(funcao_simplificada, g_simplificada, a, b)
            plotar_area_entre_funcoes(funcao_simplificada, g_simplificada, a, b)
        except ValueError:
            resultado_integral_definida.config(text="Valores inválidos para a, b ou n.")

# Interface gráfica
root = tk.Tk()
root.title("Projeto Cálculo II")
root.geometry("1200x800")

main_frame = tk.Frame(root)
main_frame.pack(fill=tk.BOTH, expand=True)

canvas_left = tk.Canvas(main_frame, width=400)
scrollbar = tk.Scrollbar(main_frame, orient="vertical", command=canvas_left.yview)
scrollable_frame = tk.Frame(canvas_left)

scrollable_frame.bind(
    "<Configure>",
    lambda e: canvas_left.configure(scrollregion=canvas_left.bbox("all"))
)

canvas_left.create_window((0, 0), window=scrollable_frame, anchor="nw")
canvas_left.configure(yscrollcommand=scrollbar.set)

canvas_left.pack(side=tk.LEFT, fill=tk.Y, expand=True)
scrollbar.pack(side=tk.LEFT, fill=tk.Y)

frame_plot = tk.Frame(main_frame, width=800, height=600)
frame_plot.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

label_funcao_f = tk.Label(scrollable_frame, text="Digite a função f(x):")
label_funcao_f.pack(pady=5)
entrada_funcao_f = tk.Entry(scrollable_frame, width=30, font=("Arial", 14))
entrada_funcao_f.pack(pady=5)

label_funcao_g = tk.Label(scrollable_frame, text="Digite a função g(x):")
label_funcao_g.pack(pady=5)
entrada_funcao_g = tk.Entry(scrollable_frame, width=30, font=("Arial", 14))
entrada_funcao_g.pack(pady=5)

label_valores_ab = tk.Label(scrollable_frame, text="Digite os valores de 'a' e 'b' para o intervalo:")
label_valores_ab.pack(pady=5)
entrada_a = tk.Entry(scrollable_frame, width=10)
entrada_a.pack(pady=2)
entrada_b = tk.Entry(scrollable_frame, width=10)
entrada_b.pack(pady=2)

label_n = tk.Label(scrollable_frame, text="Número de retângulos para Riemann:")
label_n.pack(pady=5)
entrada_n = tk.Entry(scrollable_frame, width=10)
entrada_n.pack(pady=2)

botao_calcular = tk.Button(scrollable_frame, text="Calcular e Plotar", command=calcular_e_plotar)
botao_calcular.pack(pady=10)

canvas_resultados = tk.Canvas(scrollable_frame, width=400, height=500)
scrollbar_resultados_y = tk.Scrollbar(scrollable_frame, orient="vertical", command=canvas_resultados.yview)
scrollbar_resultados_x = tk.Scrollbar(scrollable_frame, orient="horizontal", command=canvas_resultados.xview)
resultados_frame = tk.Frame(canvas_resultados)

resultados_frame.bind(
    "<Configure>",
    lambda e: canvas_resultados.configure(scrollregion=canvas_resultados.bbox("all"))
)

canvas_resultados.create_window((0, 0), window=resultados_frame, anchor="nw")
canvas_resultados.configure(yscrollcommand=scrollbar_resultados_y.set, xscrollcommand=scrollbar_resultados_x.set)

canvas_resultados.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
scrollbar_resultados_y.pack(side=tk.RIGHT, fill=tk.Y)
scrollbar_resultados_x.pack(side=tk.BOTTOM, fill=tk.X)

# Configurações dos Labels para exibir os resultados de f(x) e g(x)
resultado_funcao_f = tk.Label(resultados_frame)
resultado_funcao_f.pack(pady=5)

resultado_funcao_g = tk.Label(resultados_frame)
resultado_funcao_g.pack(pady=5)

label_integral_indefinida = tk.Label(resultados_frame)
label_integral_indefinida.pack(pady=5)

resultado_integral_definida = tk.Label(resultados_frame)
resultado_integral_definida.pack(pady=5)

resultado_riemann = tk.Label(resultados_frame)
resultado_riemann.pack(pady=5)

resultado_integral = tk.Label(resultados_frame)
resultado_integral.pack(pady=5)

root.mainloop()
