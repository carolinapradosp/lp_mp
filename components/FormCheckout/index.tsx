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

    const isCpfError =
        paymentError ===
        'CPF inválido. Por favor, verifique e tente novamente.';

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
            ];

            const newErrors: Errors = {};

            requiredFields.forEach((field) => {

                if (
                    !formData[field as keyof FormDataProps]
                        ?.toString()
                        .trim()
                ) {
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

    const inputClass = (field: string) => `
        h-14 w-full rounded-2xl border bg-white
        px-5 text-neutral-900 placeholder:text-neutral-400
        outline-none transition-all duration-300
        shadow-sm
        ${errors[field] || (field === 'cpf' && isCpfError)
            ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
            : 'border-neutral-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
        }
    `;

    return (
        <>
            {/* DADOS PESSOAIS */}
            <div className="mb-10">

                <div className="mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900">
                        Dados pessoais
                    </h2>

                    <p className="mt-2 text-sm text-neutral-500">
                        Utilize seus dados reais para garantir a aprovação do pagamento.
                    </p>
                </div>

                <div className="grid gap-5">

                    {/* NOME */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-700">
                            Nome completo
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Digite seu nome completo"
                            className={inputClass('name')}
                        />

                        {errors.name && (
                            <p className="mt-2 text-sm font-medium text-red-500">
                                O nome é obrigatório
                            </p>
                        )}
                    </div>

                    {/* EMAIL / TELEFONE */}
                    <div className="grid gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                E-mail
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Digite seu e-mail"
                                className={inputClass('email')}
                            />

                            {errors.email && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O e-mail é obrigatório
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                Telefone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                                className={inputClass('phone')}
                            />

                            {errors.phone && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O telefone é obrigatório
                                </p>
                            )}
                        </div>

                    </div>

                    {/* CPF */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-700">
                            CPF
                        </label>

                        <input
                            ref={cpfRef}
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            className={inputClass('cpf')}
                        />

                        {errors.cpf && (
                            <p className="mt-2 text-sm font-medium text-red-500">
                                O CPF é obrigatório
                            </p>
                        )}

                        {!errors.cpf && isCpfError && (
                            <p className="mt-2 text-sm font-medium text-red-500">
                                {paymentError}
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* ENDEREÇO */}
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900">
                        Endereço de entrega
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        Informe o endereço onde deseja receber o pedido.
                    </p>
                </div>

                <div className="grid gap-5">

                    {/* CEP / ENDEREÇO */}
                    <div className="grid gap-5 md:grid-cols-3">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                CEP
                            </label>

                            <input
                                type="text"
                                name="cep"
                                value={formData.cep}
                                onChange={handleChange}
                                placeholder="00000-000"
                                className={inputClass('cep')}
                            />

                            {errors.cep && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O CEP é obrigatório
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                Rua / Avenida
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Rua, avenida..."
                                className={inputClass('address')}
                            />

                            {errors.address && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O endereço é obrigatório
                                </p>
                            )}
                        </div>

                    </div>

                    {/* NÚMERO / BAIRRO */}
                    <div className="grid gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                Número
                            </label>

                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                placeholder="Número"
                                className={inputClass('number')}
                            />

                            {errors.number && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O número é obrigatório
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                Bairro
                            </label>

                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="Bairro"
                                className={inputClass('district')}
                            />

                            {errors.neighborhood && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O bairro é obrigatório
                                </p>
                            )}
                        </div>

                    </div>

                    {/* CIDADE / ESTADO */}
                    <div className="grid gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                Cidade
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Cidade"
                                className={inputClass('city')}
                            />

                            {errors.city && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    A cidade é obrigatória
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                Estado
                            </label>

                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="UF"
                                maxLength={2}
                                className={inputClass('state')}
                            />

                            {errors.state && (
                                <p className="mt-2 text-sm font-medium text-red-500">
                                    O estado é obrigatório
                                </p>
                            )}
                        </div>

                    </div>

                    {/* COMPLEMENTO */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-neutral-700">
                            Complemento
                        </label>

                        <input
                            type="text"
                            name="complement"
                            value={formData.complement}
                            onChange={handleChange}
                            placeholder="Apartamento, bloco..."
                            className={inputClass('complement')}
                        />
                    </div>


                </div>
            </div>
        </>
    );
}