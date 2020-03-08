import { Op } from 'sequelize';
import * as Yup from 'yup';

import User from '../models/User';
import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
    async index(req, res) {
        const deliveries = await Delivery.findAll({
            where: { canceled_at: { [Op.ne]: null } },
        });

        return res.json(deliveries);
    }

    async show(req, res) {
        const deliveries = await Delivery.findOne({
            where: {
                canceled_at: { [Op.ne]: null },
                id: req.params.id,
            },
        });

        if (!deliveries) {
            return res
                .status(400)
                .json({ error: 'This delivery does not exist' });
        }

        if (deliveries.length === 0) {
            return res
                .status(400)
                .json({ error: 'This delivery has no problems' });
        }

        return res.json(deliveries);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            description: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation failed' });
        }

        const delivery_id = req.params.id;

        const delivery = await Delivery.findByPk(delivery_id);

        if (!delivery) {
            return res
                .status(400)
                .json({ error: 'This delivery does not exist' });
        }

        const deliveryProblem = await DeliveryProblem.create({
            delivery_id,
            description: req.body.description,
        });

        return res.json(deliveryProblem);
    }

    async delete(req, res) {
        const user = await User.findByPk(req.userId);

        if (!user.provider) {
            return res.json({ error: 'User is not a provider' });
        }

        const delivery = await Delivery.findOne({
            where: { id: req.params.id },
        });

        if (!delivery) {
            return res.json({ error: 'This delivery does not exist' });
        }

        if (delivery.canceled_at) {
            return res.json({
                error: 'This delivery has already been canceled',
            });
        }

        delivery.canceled_at = new Date();
        delivery.save();

        return res.json(delivery);
    }
}

export default new DeliveryProblemController();
