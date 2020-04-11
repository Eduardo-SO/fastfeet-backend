import * as Yup from 'yup';

import Mail from '../../lib/Mail';

import User from '../models/User';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class DeliveryController {
    async index(req, res) {
        const deliveries = await Delivery.findAll({
            attributes: [
                'id',
                'product',
                'canceled_at',
                'start_date',
                'end_date',
                'recipient_id',
                'deliveryman_id',
                'signature_id',
            ],
            include: [
                {
                    model: Recipient,
                    as: 'recipient',
                    attributes: [
                        'name',
                        'street',
                        'number',
                        'zip_code',
                        'state',
                        'city',
                    ],
                },
                {
                    model: Deliveryman,
                    as: 'deliveryman',
                    attributes: ['name'],
                },
            ],
        });

        return res.json(deliveries);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
            product: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const user = await User.findOne({ where: { id: req.userId } });

        if (!user.provider) {
            return res.status(401).json({ error: 'User is not a provider' });
        }

        const { recipient_id, deliveryman_id } = req.body;

        const recipientExist = await Recipient.findByPk(recipient_id);
        if (!recipientExist) {
            return res.json({ error: 'This recipient does not exist' });
        }

        const deliveryman = await Deliveryman.findByPk(deliveryman_id);
        if (!deliveryman) {
            return res.json({ error: 'This deliveryman does not exist' });
        }

        const { product } = req.body;

        await Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: `${product} pronto para ser retirado!`,
            text: `${product} está pronto para ser retirado por você na transportadora!`,
        });

        const delivery = await Delivery.create(req.body);

        return res.json(delivery);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
            product: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const user = await User.findOne({ where: { id: req.userId } });

        if (!user.provider) {
            return res.status(401).json({ error: 'User is not a provider' });
        }

        const { recipient_id, deliveryman_id } = req.body;
        const { id } = req.params;

        const deliveryExist = await Delivery.findByPk(id);
        if (!deliveryExist) {
            return res.json({ error: 'This delivery does not exist' });
        }

        const recipientExist = await Recipient.findByPk(recipient_id);
        if (!recipientExist) {
            return res.json({ error: 'This recipient does not exist' });
        }

        const deliveryman = await Deliveryman.findByPk(deliveryman_id);
        if (!deliveryman) {
            return res.json({ error: 'This deliveryman does not exist' });
        }

        const delivery = await Delivery.findOne({
            where: { id: req.params.id },
        });
        delivery.update(req.body);
        return res.json(delivery);
    }
}

export default new DeliveryController();
