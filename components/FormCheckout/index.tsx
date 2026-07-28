// components/FormCheckout/index.tsx
import { FormDataProps } from "@/interfaces/FormCheckout";
import { maskCPF, maskPhone } from "@/utils/utils";
import { useEffect, useRef, useState } from "react";

type FormCheckoutProps = {
    formData: FormDataProps;
    setFormData: React.Dispatch<React.SetStateAction<FormDataProps>>;
    paymentError: string;
    setPaymentError: React.Dispatch<React.SetStateAction<string>>;
};

type Errors = {
    [key: string]: boolean;
};

export default function FormCheckout({
    formData,
    setFormData,
    paymentError,
    setPaymentError,
}: FormCheckoutProps) {

    const [errors, setErrors] = useState<Errors>({});
    const cpfRef = useRef<HTMLInputElement>(null);

    const isCpfError = paymentError === 'CPF inválido. Por favor, verifique e tente novamente.';

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'phone') formattedValue = maskPhone(value);
        if (name === 'cpf') formattedValue = maskCPF(value);

        setFormData((prev) => ({
            ...prev,
            [name]: formattedValue
        }));

        if (value.trim() !== '') {
            setErrors((prev) => ({
                ...prev,
                [name]: false,
            }));
        }

        if (name === 'cpf' && paymentError) {
            setPaymentError('');
        }
    }

    useEffect(() => {
        function validateForm() {
            const requiredFields = [
                'name',
                'email',
                'phone',
                'cpf',
                'cep',
                'address',
                'number',
                'district', // Corrigido para bater com o name mapeado
                'city',
                'state',
            ];

            const newErrors: Errors = {};

            requiredFields.forEach((field) => {
                if (!formData[field as keyof FormDataProps]?.toString().trim()) {
                    newErrors[field] = true;
                }
            });

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        (window as any).validateCheckoutForm = validateForm;
    }, [formData]);

    useEffect(() => {
        if (isCpfError && cpfRef.current) {
            cpfRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            cpfRef.current.focus();
        }
    }, [isCpfError]);

    // Input minimalista, plano e sem sombras, alinhado ao seu @theme
    const inputClass = (field: string) => `
        h-12 w-full border bg-white
        px-4 text-sm text-[var(--color-brand-dark)] placeholder:text-[var(--color-brand-muted)]/50
        outline-none transition-colors duration-200
        ${errors[field] || (field === 'cpf' && isCpfError)
            ? 'border-red-500 focus:border-red-600'
            : 'border-[var(--color-brand-border)] focus:border-[var(--color-brand-dark)]'
        }
    `;

    // Labels minimalistas padronizadas
    const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-dark)]";
    const errorTextClass = "mt-1.5 text-xs font-medium text-red-500";

    return (
        <div className="space-y-12">

            {/* SEÇÃO: DADOS PESSOAIS */}
            <div>
                <div className="mb-6 border-b border-[var(--color-brand-border)] pb-4">
                    <h2 className="text-xl font-medium tracking-tight text-[var(--color-brand-dark)]">
                        Dados pessoais
                    </h2>
                    <p className="mt-1 text-xs text-[var(--color-brand-muted)]">
                        Utilize seus dados reais para garantir a aprovação imediata do seu pagamento.
                    </p>
                </div>

                <div className="grid gap-5">
                    {/* NOME */}
                    <div>
                        <label className={labelClass}>Nome completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Digite seu nome completo"
                            className={inputClass('name')}
                        />
                        {errors.name && <p className={errorTextClass}>O nome completo é obrigatório</p>}
                    </div>

                    {/* EMAIL / TELEFONE */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                className={inputClass('email')}
                            />
                            {errors.email && <p className={errorTextClass}>O e-mail é obrigatório</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Telefone / WhatsApp</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                                className={inputClass('phone')}
                            />
                            {errors.phone && <p className={errorTextClass}>O telefone é obrigatório</p>}
                        </div>
                    </div>

                    {/* CPF */}
                    <div>
                        <label className={labelClass}>CPF</label>
                        <input
                            ref={cpfRef}
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            className={inputClass('cpf')}
                        />
                        {errors.cpf && <p className={errorTextClass}>O CPF é obrigatório</p>}
                        {!errors.cpf && isCpfError && <p className={errorTextClass}>{paymentError}</p>}
                    </div>
                </div>
            </div>

            {/* SEÇÃO: ENDEREÇO */}
            <div>
                <div className="mb-6 border-b border-[var(--color-brand-border)] pb-4">
                    <h2 className="text-xl font-medium tracking-tight text-[var(--color-brand-dark)]">
                        Endereço de entrega
                    </h2>
                    <p className="mt-1 text-xs text-[var(--color-brand-muted)]">
                        Informe onde deseja receber o seu pacote.
                    </p>
                </div>

                <div className="grid gap-5">
                    {/* CEP / ENDEREÇO */}
                    <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>CEP</label>
                            <input
                                type="text"
                                name="cep"
                                value={formData.cep}
                                onChange={handleChange}
                                placeholder="00000-000"
                                className={inputClass('cep')}
                            />
                            {errors.cep && <p className={errorTextClass}>O CEP é obrigatório</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>Rua / Avenida</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nome da rua, avenida..."
                                className={inputClass('address')}
                            />
                            {errors.address && <p className={errorTextClass}>O endereço é obrigatório</p>}
                        </div>
                    </div>

                    {/* NÚMERO / BAIRRO */}
                    <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>Número</label>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                placeholder="123"
                                className={inputClass('number')}
                            />
                            {errors.number && <p className={errorTextClass}>Obrigatório</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>Bairro</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="Bairro"
                                className={inputClass('district')}
                            />
                            {errors.district && <p className={errorTextClass}>O bairro é obrigatório</p>}
                        </div>
                    </div>

                    {/* CIDADE / ESTADO / COMPLEMENTO */}
                    <div className="grid gap-5 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Cidade</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Cidade"
                                className={inputClass('city')}
                            />
                            {errors.city && <p className={errorTextClass}>A cidade é obrigatória</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Estado</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="UF"
                                maxLength={2}
                                className={inputClass('state')}
                            />
                            {errors.state && <p className={errorTextClass}>Obrigatório</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Complemento</label>
                            <input
                                type="text"
                                name="complement"
                                value={formData.complement}
                                onChange={handleChange}
                                placeholder="Apt, bloco..."
                                className={inputClass('complement')}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}