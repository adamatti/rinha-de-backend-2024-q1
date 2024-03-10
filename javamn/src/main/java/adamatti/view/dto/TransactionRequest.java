package adamatti.view.dto;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.*;

@Serdeable
public class TransactionRequest {
    @Positive()
    @Min(1)

    // Micronaut is receiving the number and removing the decimals, using flow for proper data validation
    private float valor;
    @NotBlank()
    @Size(min=1, max=1)
    @Pattern(regexp = "d|c")
    private String tipo;
    @NotBlank()
    @Size(min=1, max=10)
    private String descricao;

    public float getValor() {
        return valor;
    }

    public void setValor(float valor) {
        this.valor = valor;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getTipo() {
        return tipo;
    }

    public String getDescricao() {
        return descricao;
    }
}
