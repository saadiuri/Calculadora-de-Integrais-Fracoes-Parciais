import tkinter as tk
from tkinter import ttk
import sympy as sp
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
from PIL import Image, ImageTk
import numpy as np
import re

# Funções de cálculo e formatação

def formatar_funcao(entrada_funcao):
    print("Executando formatar_funcao")  # Debug
    
    # Substitui "^" por "**" para aceitar ambas as notações de potenciação
    entrada_funcao = entrada_funcao.replace("^", "**")
    
    # Adiciona '*' entre número e variável onde necessário (ex: 2x -> 2*x)
    entrada_funcao = re.sub(r"(\d)([a-zA-Z])", r"\1*\2", entrada_funcao)
    
    x = sp.symbols('x')
    funcao = sp.sympify(entrada_funcao)
    funcao_expandida = sp.expand(funcao)  # Expande a função para evitar fatorações indesejadas
    expressao_latex = sp.latex(funcao_expandida)
    
    # Renderiza a expressão LaTeX como uma imagem usando matplotlib
    plt.figure(figsize=(6, 1.5))
    plt.text(0.5, 0.5, f"$f(x) = {expressao_latex}$", horizontalalignment='center', verticalalignment='center', fontsize=20)
    plt.axis('off')
    plt.savefig("funcao.png", format="png", bbox_inches='tight', dpi=100)
    plt.close()
    
    img = Image.open("funcao.png")
    img_tk = ImageTk.PhotoImage(img)
    resultado_funcao.config(image=img_tk)
    resultado_funcao.image = img_tk
    
    return funcao_expandida


def calcular_valor_funcional(funcao_simplificada, a):
    print("Executando calcular_valor_funcional")  # Debug
    x = sp.symbols('x')
    valor_funcional = funcao_simplificada.subs(x, a)
    return valor_funcional

def plotar_funcao(funcao_simplificada, valores_calculados):
    print("Executando plotar_funcao")  # Debug
    for widget in frame_plot.winfo_children():
        widget.destroy()
    
    x = sp.symbols('x')
    f_np = sp.lambdify(x, funcao_simplificada, 'numpy')
    
    x_vals = np.linspace(-5, 5, 200)
    y_vals = f_np(x_vals)
    
    fig, ax = plt.subplots()
    ax.plot(x_vals, y_vals, label="f(x)")
    ax.set_xlim(-5, 5)
    ax.set_ylim(-10, 10)
    ax.axhline(0, color='black', linewidth=0.5)
    ax.axvline(0, color='black', linewidth=0.5)
    ax.grid()
    
    for a, f_a in valores_calculados:
        ax.plot(a, f_a, 'ro')
        ax.text(a, f_a, f'({a:.1f}, {f_a:.1f})', fontsize=9, ha='left', va='bottom')
    
    ax.relim()
    ax.autoscale_view()
    
    canvas = FigureCanvasTkAgg(fig, master=frame_plot)
    toolbar = NavigationToolbar2Tk(canvas, frame_plot)
    toolbar.update()
    canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
    canvas.draw()

# Interface gráfica
def calcular_e_plotar():
    print("Botão 'Calcular e Plotar' clicado")  # Debug
    entrada = entrada_funcao.get()
    funcao_simplificada = formatar_funcao(entrada)
    
    resultado_calculos.config(state=tk.NORMAL)
    resultado_calculos.delete("1.0", tk.END)
    
    valores_calculados = []
    valores = valores_a.get().split(',')
    for i, valor in enumerate(valores[:5]):
        try:
            a = float(valor.strip())
            f_a = calcular_valor_funcional(funcao_simplificada, a)
            valores_calculados.append((a, f_a))
            resultado_calculos.insert(tk.END, f"a = {a}, f({a}) = {f_a}\n")
        except ValueError:
            resultado_calculos.insert(tk.END, f"Valor inválido para 'a': {valor}\n")
    
    resultado_calculos.config(state=tk.DISABLED)
    plotar_funcao(funcao_simplificada, valores_calculados)

def inserir_texto(texto):
    entrada_funcao.insert(tk.END, texto)

def limpar_entrada():
    entrada_funcao.delete(0, tk.END)

# Configuração do Tkinter
root = tk.Tk()
root.title("Projeto Cálculo II")
root.geometry("1200x600")

# Layout principal
main_frame = tk.Frame(root)
main_frame.pack(fill=tk.BOTH, expand=True)

# Frame esquerdo para entradas e resultados
left_frame = tk.Frame(main_frame, width=400)
left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)

# Frame direito para o gráfico
frame_plot = tk.Frame(main_frame, width=800, height=600)
frame_plot.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

# Entrada de função
label_funcao = tk.Label(left_frame, text="Digite a função polinomial em x:")
label_funcao.pack(pady=5)
entrada_funcao = tk.Entry(left_frame, width=30, font=("Arial", 14))
entrada_funcao.pack(pady=5)

# Botões para operadores matemáticos
botoes_frame = tk.Frame(left_frame)
botoes_frame.pack(pady=5)

operadores = [
    ('x', 'x'), ('x²', '**2'), ('+', '+'), ('-', '-'),
    ('*', '*'), ('/', '/'), ('^', '**'), ('√', 'sqrt('),
    ('(', '('), (')', ')')
]

for texto, valor in operadores:
    button = tk.Button(botoes_frame, text=texto, width=5, height=2,
                       command=lambda valor=valor: inserir_texto(valor))
    button.pack(side=tk.LEFT, padx=2, pady=2)

# Botão de limpar
botao_limpar = tk.Button(left_frame, text="Limpar", command=limpar_entrada, width=10)
botao_limpar.pack(pady=5)

# Entrada de valores de 'a'
label_valores_a = tk.Label(left_frame, text="Digite os valores de 'a' separados por vírgula:")
label_valores_a.pack(pady=5)
valores_a = tk.Entry(left_frame, width=30)
valores_a.pack(pady=5)

# Botão para calcular e plotar
botao_calcular = tk.Button(left_frame, text="Calcular e Plotar", command=calcular_e_plotar)
botao_calcular.pack(pady=10)

# Exibição da função formatada usando Label
label_resultado_funcao = tk.Label(left_frame, text="Função Formatada:")
label_resultado_funcao.pack(pady=5)
resultado_funcao = tk.Label(left_frame)
resultado_funcao.pack(pady=5)

# Exibição dos cálculos
label_resultado_calculos = tk.Label(left_frame, text="Resultados dos Cálculos:")
label_resultado_calculos.pack(pady=5)
resultado_calculos = tk.Text(left_frame, height=10, width=40, font=("Arial", 12), state=tk.DISABLED)
resultado_calculos.pack(pady=5)

root.mainloop()
